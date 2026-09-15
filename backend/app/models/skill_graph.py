from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin

class SkillOntologyNode(Base, TimestampMixin):
    """
    Skill Knowledge Graph node representing a canonical or alias skill/concept.
    """
    __tablename__ = "skill_ontology_nodes"

    name = Column(String(100), unique=True, nullable=False, index=True)
    canonical_name = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default="General", nullable=False)
    description = Column(Text, nullable=True)


class SkillRelationship(Base, TimestampMixin):
    """
    Typed relationship between skills: IS_A, REQUIRES, RELATED_TO, PREREQUISITE_OF, ALIAS_OF.
    """
    __tablename__ = "skill_relationships"

    source_skill = Column(String(100), nullable=False, index=True)
    target_skill = Column(String(100), nullable=False, index=True)
    relation_type = Column(String(50), nullable=False)  # IS_A, REQUIRES, RELATED_TO, PREREQUISITE_OF, ALIAS_OF
    weight = Column(Float, default=1.0, nullable=False) # 0.0 to 1.0 semantic proximity


class CandidateSkillPassport(Base, TimestampMixin):
    """
    Candidate Skill Passport: Verified credentials cross-referencing
    Resume Evidence, Assessment Verification, and Interview Verification.
    """
    __tablename__ = "candidate_skill_passports"

    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True)
    passport_data_json = Column(Text, nullable=False)
    overall_verified_score = Column(Float, default=0.0, nullable=False)

    candidate = relationship("CandidateProfile")
    application = relationship("Application")
