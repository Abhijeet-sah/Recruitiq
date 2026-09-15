import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.candidate import Application, CandidateProfile, Resume
from app.models.job import Job
from app.models.evidence import EvidenceRecord, ResumeIntegrityReport
from app.services.evidence_grounding import evidence_grounding_engine
from app.services.resume_security import resume_integrity_analyzer
from app.services.evidence_consensus import evidence_consensus_engine

router = APIRouter(prefix="/evidence", tags=["Evidence Grounding & Document Security"])

@router.get("/{application_id}")
def get_application_evidence(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieve grounded evidence records (exact snippets, sections, pages, offsets, confidence)
    for an application. If not yet extracted in DB, automatically extracts from resume and job.
    """
    app_obj = db.query(Application).filter(Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    existing_records = db.query(EvidenceRecord).filter(
        EvidenceRecord.application_id == application_id
    ).all()

    # If records exist, return them
    if existing_records:
        evidence_list = []
        for r in existing_records:
            meta = {}
            if r.metadata_json:
                try:
                    meta = json.loads(r.metadata_json)
                except Exception:
                    pass
            evidence_list.append({
                "id": r.id,
                "claim_type": r.claim_type,
                "claim_key": r.claim_key,
                "source_type": r.source_type,
                "source_document": r.source_document,
                "section": r.section,
                "page_number": r.page_number,
                "evidence_text": r.evidence_text,
                "char_start": r.char_start,
                "char_end": r.char_end,
                "confidence": r.confidence,
                "metadata": meta
            })
        return {
            "application_id": application_id,
            "count": len(evidence_list),
            "evidence": evidence_list
        }

    # Otherwise, extract live from candidate resume and target skills
    cand = db.query(CandidateProfile).filter(CandidateProfile.id == app_obj.candidate_id).first()
    job = db.query(Job).filter(Job.id == app_obj.job_id).first()

    resume_text = ""
    resume_doc_name = "Resume Document"
    if cand:
        resume = db.query(Resume).filter(Resume.candidate_id == cand.id).first()
        if resume:
            resume_text = resume.raw_text or ""
            resume_doc_name = getattr(resume, "filename", getattr(resume, "file_name", "Resume.pdf")) or "Resume.pdf"

    target_skills = []
    if job and job.skills:
        target_skills = [s.skill_name for s in job.skills]
    elif cand and cand.skills:
        target_skills = [s.skill_name for s in cand.skills]
    if not target_skills:
        target_skills = ["Python", "FastAPI", "React", "SQL", "Docker", "Git"]

    extracted = evidence_grounding_engine.extract_resume_evidence(
        resume_text=resume_text,
        target_skills=target_skills,
        document_name=resume_doc_name
    )

    # Persist in DB for audit trail
    persisted_evidence = []
    for item in extracted:
        rec = EvidenceRecord(
            application_id=application_id,
            candidate_id=cand.id if cand else None,
            job_id=job.id if job else None,
            claim_type=item.get("claim_type", "SKILL"),
            claim_key=item.get("claim_key", "Skill"),
            source_type=item.get("source_type", "RESUME"),
            source_document=item.get("source_document", resume_doc_name),
            section=item.get("section", "Experience"),
            page_number=item.get("page_number", 1),
            evidence_text=item.get("evidence_text", ""),
            char_start=item.get("char_start", 0),
            char_end=item.get("char_end", 0),
            confidence=item.get("confidence", 90.0)
        )
        db.add(rec)
        persisted_evidence.append(item)

    try:
        db.commit()
    except Exception:
        db.rollback()

    return {
        "application_id": application_id,
        "count": len(persisted_evidence),
        "evidence": persisted_evidence
    }

@router.get("/integrity/{resume_id}")
def get_resume_integrity(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieve or compute objective document integrity report (keyword stuffing, hidden text, prompt injection).
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    report = db.query(ResumeIntegrityReport).filter(ResumeIntegrityReport.resume_id == resume_id).first()
    if report:
        findings = []
        if report.findings_json:
            try:
                findings = json.loads(report.findings_json)
            except Exception:
                pass
        return {
            "resume_id": resume.id,
            "integrity_status": report.integrity_status,
            "integrity_score": report.integrity_score,
            "keyword_stuffing_detected": report.keyword_stuffing_detected,
            "hidden_text_detected": report.hidden_text_detected,
            "prompt_injection_flag": report.prompt_injection_flag,
            "summary_text": report.summary_text,
            "findings": findings
        }

    analysis = resume_integrity_analyzer.analyze_resume_integrity(
        raw_text=resume.raw_text or "",
        document_metadata={"filename": getattr(resume, "filename", getattr(resume, "file_name", "Resume.pdf"))}
    )

    # Persist report
    rep_obj = ResumeIntegrityReport(
        resume_id=resume.id,
        candidate_id=resume.candidate_id,
        integrity_status=analysis.get("integrity_status", "VERIFIED"),
        integrity_score=analysis.get("integrity_score", 100.0),
        keyword_stuffing_detected=analysis.get("keyword_stuffing_detected", False),
        keyword_stuffing_details_json=json.dumps(analysis.get("keyword_stuffing_details", {})),
        hidden_text_detected=analysis.get("hidden_text_detected", False),
        hidden_text_details_json=json.dumps(analysis.get("hidden_text_details", {})),
        prompt_injection_flag=analysis.get("prompt_injection_flag", "SAFE"),
        prompt_injection_details_json=json.dumps(analysis.get("prompt_injection_details", {})),
        summary_text=analysis.get("summary_text", "Document verified."),
        findings_json=json.dumps(analysis.get("findings", []))
    )
    db.add(rep_obj)
    try:
        db.commit()
    except Exception:
        db.rollback()

    return analysis

@router.post("/scan")
def scan_text_integrity(
    payload: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    On-demand document text security scan.
    """
    text = payload.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Text content required for scan")
    return resume_integrity_analyzer.analyze_resume_integrity(raw_text=text)

@router.get("/consensus/{application_id}")
def get_skill_consensus_matrix(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Cross-Module Skill Consensus:
    Synthesizes signals across Resume, Coding Assessment, and AI Interview into a unified Skill Evidence Matrix.
    """
    app_obj = db.query(Application).filter(Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    cand = db.query(CandidateProfile).filter(CandidateProfile.id == app_obj.candidate_id).first()
    job = db.query(Job).filter(Job.id == app_obj.job_id).first()

    resume_skills = [s.skill_name for s in cand.skills] if cand and cand.skills else []
    target_skills = [s.skill_name for s in job.skills] if job and job.skills else []
    all_skills = list(set(resume_skills + target_skills))
    if not all_skills:
        all_skills = ["Python", "FastAPI", "SQL", "Docker"]

    # Gather assessment results
    assessment_results = {}
    if app_obj.assessment_attempts:
        for att in app_obj.assessment_attempts:
            if att.score is not None:
                assessment_results["Technical Assessment"] = {
                    "score": att.score,
                    "passed": att.score >= 60
                }

    interview_signals = {}
    if getattr(app_obj, "interview_session", None) and app_obj.interview_session.feedback_json:
        try:
            fb = json.loads(app_obj.interview_session.feedback_json)
            interview_signals = fb.get("skills_evaluated", {})
        except Exception:
            pass

    return evidence_consensus_engine.synthesize_skill_consensus(
        candidate_skills=all_skills,
        resume_evidence={"skills": resume_skills, "years_exp": cand.total_experience_years if cand else 2},
        assessment_results=assessment_results,
        interview_signals=interview_signals,
        project_claims=[p.title for p in cand.projects] if cand and hasattr(cand, "projects") and cand.projects else []
    )
