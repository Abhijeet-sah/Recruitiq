import logging
from typing import Dict, Any, List, Set, Optional, Tuple

logger = logging.getLogger(__name__)

class SkillKnowledgeGraph:
    """
    Skill Knowledge Graph & Transferable Skill Intelligence Engine.
    Models canonical competencies, taxonomy hierarchies (IS_A), dependencies (REQUIRES, PREREQUISITE_OF),
    analogous capabilities (RELATED_TO), and aliases (ALIAS_OF).
    Evaluates transferable readiness instead of treating missing skills as completely absent.
    """

    # Comprehensive curated technology ontology
    ONTOLOGY_NODES = {
        # Languages
        "python": {"canonical": "Python", "category": "Languages"},
        "javascript": {"canonical": "JavaScript", "category": "Languages"},
        "typescript": {"canonical": "TypeScript", "category": "Languages"},
        "java": {"canonical": "Java", "category": "Languages"},
        "c++": {"canonical": "C++", "category": "Languages"},
        "go": {"canonical": "Go", "category": "Languages"},
        "sql": {"canonical": "SQL", "category": "Languages"},
        "r": {"canonical": "R", "category": "Languages"},

        # Backend Frameworks
        "fastapi": {"canonical": "FastAPI", "category": "Backend"},
        "django": {"canonical": "Django", "category": "Backend"},
        "flask": {"canonical": "Flask", "category": "Backend"},
        "node.js": {"canonical": "Node.js", "category": "Backend"},
        "express": {"canonical": "Express", "category": "Backend"},
        "spring boot": {"canonical": "Spring Boot", "category": "Backend"},

        # Frontend Frameworks
        "react": {"canonical": "React", "category": "Frontend"},
        "vue": {"canonical": "Vue", "category": "Frontend"},
        "angular": {"canonical": "Angular", "category": "Frontend"},
        "next.js": {"canonical": "Next.js", "category": "Frontend"},
        "redux": {"canonical": "Redux", "category": "Frontend"},

        # Databases
        "postgresql": {"canonical": "PostgreSQL", "category": "Databases"},
        "mysql": {"canonical": "MySQL", "category": "Databases"},
        "mongodb": {"canonical": "MongoDB", "category": "Databases"},
        "redis": {"canonical": "Redis", "category": "Databases"},

        # Cloud & DevOps
        "docker": {"canonical": "Docker", "category": "DevOps"},
        "kubernetes": {"canonical": "Kubernetes", "category": "DevOps"},
        "aws": {"canonical": "AWS", "category": "Cloud"},
        "gcp": {"canonical": "GCP", "category": "Cloud"},
        "azure": {"canonical": "Azure", "category": "Cloud"},
        "ci/cd": {"canonical": "CI/CD", "category": "DevOps"},
        "terraform": {"canonical": "Terraform", "category": "DevOps"},
        "linux": {"canonical": "Linux", "category": "DevOps"},

        # AI & Machine Learning
        "machine learning": {"canonical": "Machine Learning", "category": "Data & AI"},
        "deep learning": {"canonical": "Deep Learning", "category": "Data & AI"},
        "pytorch": {"canonical": "PyTorch", "category": "Data & AI"},
        "tensorflow": {"canonical": "TensorFlow", "category": "Data & AI"},
        "scikit-learn": {"canonical": "Scikit-learn", "category": "Data & AI"},
        "pandas": {"canonical": "Pandas", "category": "Data & AI"},
        "numpy": {"canonical": "NumPy", "category": "Data & AI"},
        "nlp": {"canonical": "NLP", "category": "Data & AI"}
    }

    # Directed relationships: (Source, Target, Type, Weight)
    RELATIONSHIPS = [
        # ALIAS_OF (Weight 1.0)
        ("k8s", "kubernetes", "ALIAS_OF", 1.0),
        ("postgres", "postgresql", "ALIAS_OF", 1.0),
        ("reactjs", "react", "ALIAS_OF", 1.0),
        ("nodejs", "node.js", "ALIAS_OF", 1.0),
        ("js", "javascript", "ALIAS_OF", 1.0),
        ("ts", "typescript", "ALIAS_OF", 1.0),
        ("py", "python", "ALIAS_OF", 1.0),
        ("mongo", "mongodb", "ALIAS_OF", 1.0),

        # REQUIRES / DEPENDENCY (Weight 0.90)
        ("fastapi", "python", "REQUIRES", 0.95),
        ("django", "python", "REQUIRES", 0.95),
        ("flask", "python", "REQUIRES", 0.90),
        ("react", "javascript", "REQUIRES", 0.90),
        ("next.js", "react", "REQUIRES", 0.95),
        ("express", "node.js", "REQUIRES", 0.95),
        ("pytorch", "python", "REQUIRES", 0.90),
        ("tensorflow", "python", "REQUIRES", 0.90),
        ("scikit-learn", "python", "REQUIRES", 0.90),
        ("kubernetes", "docker", "REQUIRES", 0.85),

        # RELATED_TO / TRANSFERABLE (Weight 0.70 - 0.85)
        ("fastapi", "flask", "RELATED_TO", 0.82),
        ("fastapi", "django", "RELATED_TO", 0.78),
        ("flask", "django", "RELATED_TO", 0.80),
        ("pytorch", "tensorflow", "RELATED_TO", 0.85),
        ("react", "vue", "RELATED_TO", 0.80),
        ("react", "angular", "RELATED_TO", 0.72),
        ("postgresql", "mysql", "RELATED_TO", 0.85),
        ("aws", "gcp", "RELATED_TO", 0.82),
        ("aws", "azure", "RELATED_TO", 0.80),
        ("docker", "kubernetes", "RELATED_TO", 0.75),

        # PREREQUISITE_OF
        ("python", "machine learning", "PREREQUISITE_OF", 0.85),
        ("machine learning", "deep learning", "PREREQUISITE_OF", 0.85),
        ("linux", "docker", "PREREQUISITE_OF", 0.80),
        ("sql", "postgresql", "PREREQUISITE_OF", 0.90),
        ("javascript", "typescript", "PREREQUISITE_OF", 0.85)
    ]

    def normalize_skill(self, skill: str) -> str:
        s_low = skill.strip().lower()
        if s_low in self.ONTOLOGY_NODES:
            return self.ONTOLOGY_NODES[s_low]["canonical"]
        # Check alias
        for src, tgt, rel, _ in self.RELATIONSHIPS:
            if rel == "ALIAS_OF" and src == s_low:
                return self.ONTOLOGY_NODES.get(tgt, {}).get("canonical", tgt.capitalize())
        return skill.strip()

    def evaluate_transferability(
        self,
        required_skill: Any = None,
        candidate_skills: Any = None,
        target_skill: Any = None
    ) -> Dict[str, Any]:
        """
        Evaluates whether candidate directly possesses the required skill,
        or holds highly transferable precursor or related skills.
        """
        if target_skill is not None and required_skill is None:
            required_skill = target_skill
        if isinstance(required_skill, list) and isinstance(candidate_skills, str):
            required_skill, candidate_skills = candidate_skills, required_skill
        if candidate_skills is None:
            candidate_skills = []

        req_norm = self.normalize_skill(str(required_skill))
        req_low = req_norm.lower()

        cand_norm_map = {self.normalize_skill(cs).lower(): cs for cs in candidate_skills}

        # 1. Direct Match
        if req_low in cand_norm_map:
            return {
                "required_skill": req_norm,
                "status": "DIRECT_MATCH",
                "direct_match": True,
                "transferability_score": 100.0,
                "matched_via": cand_norm_map[req_low],
                "explanation": f"Candidate directly possesses verified proficiency in {req_norm}."
            }

        # 2. Check Aliases
        for src, tgt, rel, weight in self.RELATIONSHIPS:
            if rel == "ALIAS_OF":
                if src == req_low and tgt in cand_norm_map:
                    return {
                        "required_skill": req_norm,
                        "status": "DIRECT_MATCH",
                        "direct_match": True,
                        "transferability_score": 100.0,
                        "matched_via": cand_norm_map[tgt],
                        "explanation": f"{cand_norm_map[tgt]} is recognized as a direct synonym/alias for {req_norm}."
                    }

        # 3. Check Related & Transferable Skills
        best_match = None
        best_score = 0.0
        best_rel = None

        for src, tgt, rel, weight in self.RELATIONSHIPS:
            if rel in ("RELATED_TO", "REQUIRES", "PREREQUISITE_OF"):
                # Case A: Candidate has tgt, job requires src
                if src == req_low and tgt in cand_norm_map:
                    score = weight * 100.0
                    if score > best_score:
                        best_score = score
                        best_match = cand_norm_map[tgt]
                        best_rel = rel
                # Case B: Candidate has src, job requires tgt
                elif tgt == req_low and src in cand_norm_map:
                    score = weight * 100.0
                    if score > best_score:
                        best_score = score
                        best_match = cand_norm_map[src]
                        best_rel = rel

        if best_match and best_score >= 70.0:
            status = "HIGH_TRANSFERABILITY" if best_score >= 80.0 else "MODERATE_TRANSFERABILITY"
            reason = (
                f"Candidate demonstrates strong foundational capability through {best_match} "
                f"which shares high conceptual overlap ({int(best_score)}%) with {req_norm}."
            )
            return {
                "required_skill": req_norm,
                "status": status,
                "direct_match": False,
                "transferability_score": round(best_score, 1),
                "matched_via": best_match,
                "explanation": reason
            }

        return {
            "required_skill": req_norm,
            "status": "MISSING",
            "direct_match": False,
            "transferability_score": 0.0,
            "matched_via": None,
            "explanation": f"No direct or closely transferable skills identified for {req_norm}."
        }

    def get_full_graph(self) -> Dict[str, Any]:
        """Returns node list and edge list for visual UI rendering."""
        nodes = []
        for key, val in self.ONTOLOGY_NODES.items():
            nodes.append({
                "id": key,
                "label": val["canonical"],
                "category": val["category"]
            })

        edges = []
        for src, tgt, rel, weight in self.RELATIONSHIPS:
            edges.append({
                "source": src,
                "target": tgt,
                "relation": rel,
                "weight": weight
            })

        return {"nodes": nodes, "edges": edges}

skill_graph = SkillKnowledgeGraph()
skill_knowledge_graph = skill_graph
