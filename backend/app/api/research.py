from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.user import User
from app.services.research_lab import research_lab_service

router = APIRouter(prefix="/research", tags=["RecruitIQ Scientific Research & Empirical Benchmarks"])

@router.get("/experiments")
def get_available_experiments(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    List available research benchmark suites for empirical platform evaluation.
    """
    return {
        "experiments": [
            {
                "id": "transformer_vs_sparse",
                "title": "Dense Transformer vs Sparse Token Matching",
                "description": "Evaluates Sentence Transformer (all-MiniLM-L6-v2) vs Token Overlap (BoW/Jaccard) on technical resume skill pairs.",
                "metrics": ["Accuracy", "Pearson Correlation", "Inference Latency"]
            },
            {
                "id": "irt_cat_vs_fixed",
                "title": "2PL IRT Computerized Adaptive Testing vs Fixed Assessment",
                "description": "Simulates ability parameter estimation efficiency, question count reduction, and standard error convergence.",
                "metrics": ["Convergence Speed", "MAE", "Question Reduction %", "Fisher Information"]
            }
        ]
    }

@router.post("/run-transformer-benchmark")
def run_transformer_benchmark(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Execute live Transformer vs Baseline benchmark.
    """
    return research_lab_service.run_transformer_vs_baseline_benchmark()

@router.post("/run-adaptive-benchmark")
def run_adaptive_benchmark(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Execute live 2PL IRT CAT vs Fixed Assessment benchmark.
    """
    return research_lab_service.run_adaptive_vs_fixed_cat_benchmark()
