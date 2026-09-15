import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.candidate import Application
from app.models.evidence import EvidenceRecord

logger = logging.getLogger(__name__)

class EvidenceConsensusEngine:
    """
    Cross-Module Evidence Consensus Engine:
    Synthesizes independent signals across Resume, Assessment, Projects, and AI Interview
    to produce the Skill Evidence Matrix and detect multi-stage verification discrepancies.
    """

    LEVEL_ORDER = {
        "beginner": 1,
        "intermediate": 2,
        "advanced": 3,
        "expert": 4
    }

    def build_consensus_matrix(
        self,
        application: Application,
        db: Session
    ) -> Dict[str, Any]:
        """
        Builds the complete Skill Evidence Matrix for an application.
        """
        cand = application.candidate
        job = application.job

        # 1. Collect skills mentioned in resume or job
        job_skills = [s.skill_name for s in job.skills]
        cand_skills = {cs.skill_name.lower(): cs for cs in cand.skills}

        # 2. Collect Assessment Attempts & Answers
        attempts = application.assessment_attempts
        completed_attempt = next((a for a in attempts if a.status.value == "COMPLETED"), None)
        topic_perf = {}
        if completed_attempt and completed_attempt.answers:
            # Aggregate score per skill
            skill_scores = {}
            for ans in completed_attempt.answers:
                q = ans.question
                if q and q.skill_tested:
                    s_key = q.skill_tested.lower()
                    skill_scores.setdefault(s_key, []).append(ans.score_earned / max(q.points_value, 1.0))
            for s_key, ratios in skill_scores.items():
                topic_perf[s_key] = (sum(ratios) / len(ratios)) * 100.0

        # 3. Collect Interview Session evaluations
        interview = application.interview_session
        interview_evals = {}
        if interview and interview.questions:
            for iq in interview.questions:
                if iq.score is not None:
                    # Map question context or default
                    interview_evals["technical_clarity"] = iq.score

        # 4. Query Grounded Evidence Records
        evidence_records = db.query(EvidenceRecord).filter(
            EvidenceRecord.application_id == application.id
        ).all()
        ev_by_skill = {}
        for er in evidence_records:
            ev_by_skill.setdefault(er.claim_key.lower(), []).append(er)

        # 5. Build Matrix Rows
        all_skill_names = list(dict.fromkeys(job_skills + [cs.skill_name for cs in cand.skills]))
        matrix_rows = []
        discrepancies = []

        for s_name in all_skill_names:
            s_low = s_name.lower()

            # Resume signal
            cs = cand_skills.get(s_low)
            resume_level = cs.level if cs else "Not Claimed"
            evs = ev_by_skill.get(s_low, [])
            resume_ev_text = f"{resume_level} ({len(evs)} citations)" if cs else "No explicit mention"

            # Assessment signal
            perf = topic_perf.get(s_low)
            if perf is not None:
                if perf >= 80.0:
                    assess_level = "Advanced"
                elif perf >= 50.0:
                    assess_level = "Intermediate"
                else:
                    assess_level = "Beginner"
                assess_ev_text = f"{assess_level} ({int(perf)}% score)"
            else:
                assess_level = None
                assess_ev_text = "Unassessed"

            # Interview signal
            interview_score = interview_evals.get("technical_clarity")
            interview_text = f"{int(interview_score)}% Rubric Score" if interview_score else "Pending Interview"

            # Consensus Determination
            if cs and assess_level:
                res_ord = self.LEVEL_ORDER.get(resume_level.lower(), 2)
                ass_ord = self.LEVEL_ORDER.get(assess_level.lower(), 2)
                diff = abs(res_ord - ass_ord)

                if diff == 0:
                    consensus = "HIGH_CONSENSUS"
                    conf = 95.0
                elif diff == 1:
                    consensus = "MODERATE_CONSENSUS"
                    conf = 80.0
                else:
                    consensus = "DISCREPANCY"
                    conf = 55.0
                    discrepancies.append({
                        "skill": s_name,
                        "resume_claim": resume_level,
                        "assessment_demonstrated": assess_level,
                        "observation": f"Candidate claimed {resume_level} level in resume but scored at {assess_level} level in verified assessment."
                    })
            elif cs:
                consensus = "RESUME_ONLY"
                conf = 72.0
            elif assess_level:
                consensus = "ASSESSMENT_ONLY"
                conf = 85.0
            else:
                consensus = "UNVERIFIED"
                conf = 40.0

            matrix_rows.append({
                "skill": s_name,
                "resume_evidence": resume_ev_text,
                "assessment_evidence": assess_ev_text,
                "interview_evidence": interview_text,
                "consensus_level": consensus,
                "confidence": conf
            })

        overall_consensus = "CONSISTENT"
        if discrepancies:
            overall_consensus = "DISCREPANCIES_DETECTED"
        elif any(r["consensus_level"] == "HIGH_CONSENSUS" for r in matrix_rows):
            overall_consensus = "STRONG_CONSENSUS"

        return {
            "overall_consensus": overall_consensus,
            "matrix": matrix_rows,
            "discrepancies": discrepancies,
            "discrepancy_count": len(discrepancies)
        }

evidence_consensus = EvidenceConsensusEngine()
evidence_consensus_engine = evidence_consensus
