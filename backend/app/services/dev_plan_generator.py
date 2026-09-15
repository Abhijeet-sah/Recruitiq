from typing import List, Dict, Any

class DevelopmentPlanService:
    """
    Personalized Skill Development Plan Generator.
    Produces structured, high-value learning roadmaps for missing or moderate skills.
    Avoids hallucinated or brittle external URLs; focuses on actionable curricula,
    milestones, and capstone practice project specifications.
    """

    CURRICULUM_CATALOG = {
        "docker": {
            "title": "Containerization & Microservices Architecture",
            "topics": [
                "Linux cgroups, namespaces, and Docker daemon architecture",
                "Writing multi-stage production Dockerfiles for minimal image size",
                "Container networking, bridge networks, and volume persistence",
                "Docker Compose multi-service local development workflows"
            ],
            "project": "Dockerize a full-stack web application with a FastAPI backend, PostgreSQL database, and Redis cache with health checks."
        },
        "kubernetes": {
            "title": "Cloud-Native Orchestration & Cluster Management",
            "topics": [
                "Pods, Deployments, ReplicaSets, and DaemonSets",
                "Services (ClusterIP, NodePort, LoadBalancer) and Ingress Controllers",
                "ConfigMaps, Secrets, and persistent volume claims (PVCs)",
                "Horizontal Pod Autoscaling (HPA) and rolling zero-downtime updates"
            ],
            "project": "Deploy a multi-tier microservice application to a local Minikube cluster with Ingress routing and HPA enabled."
        },
        "sql": {
            "title": "Advanced SQL & Database Performance Tuning",
            "topics": [
                "B-Tree and GIN indexing internals and EXPLAIN ANALYZE interpretation",
                "Window functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG)",
                "Transaction isolation levels, concurrency anomalies, and row-level locking",
                "Partitioning strategies for time-series and large data tables"
            ],
            "project": "Build an analytical query suite calculating 30-day rolling customer retention and optimize execution time by 5x using strategic indexing."
        },
        "machine learning": {
            "title": "Applied Machine Learning & Model Evaluation",
            "topics": [
                "Feature engineering, scaling, and categorical encoding pipelines",
                "Cross-validation strategies for imbalanced datasets (PR-AUC vs ROC-AUC)",
                "Tree boosting algorithms (XGBoost, LightGBM) and hyperparameter tuning",
                "Model interpretability with SHAP values and feature importance"
            ],
            "project": "Train and evaluate a fraud detection pipeline on an imbalanced dataset, explaining feature contributions via SHAP summary plots."
        },
        "react": {
            "title": "Modern React & Frontend State Architecture",
            "topics": [
                "React 18 Concurrent features (useTransition, Suspense)",
                "Optimizing re-renders using React.memo, useMemo, and useCallback",
                "Server state caching with TanStack React Query",
                "Component design systems with Tailwind CSS and accessibility (ARIA)"
            ],
            "project": "Build an interactive data dashboard with real-time filters, virtualized table rendering, and optimistic cache updates."
        },
        "fastapi": {
            "title": "High-Performance Asynchronous Python APIs",
            "topics": [
                "Asyncio event loop, coroutines, and non-blocking I/O in Python",
                "Pydantic v2 data validation and OpenAPI schema generation",
                "Dependency injection and database session management",
                "JWT authentication, role-based access control, and rate limiting"
            ],
            "project": "Build a REST API microservice with async database pooling, JWT security, and automated Pytest test coverage."
        },
        "aws": {
            "title": "Cloud Infrastructure & AWS Core Services",
            "topics": [
                "AWS IAM least-privilege security policies and role delegation",
                "Amazon EC2, ECS, and AWS Lambda serverless execution",
                "Amazon S3, RDS PostgreSQL, and DynamoDB storage choices",
                "VPC design: subnets, route tables, NAT gateways, and security groups"
            ],
            "project": "Architect an infrastructure blueprint hosting an auto-scaling API behind an Application Load Balancer with secure RDS connectivity."
        }
    }

    def generate_plan(
        self,
        candidate_id: int,
        target_role: str,
        missing_skills: List[str],
        moderate_skills: List[str]
    ) -> Dict[str, Any]:
        """
        Generate a 3-priority learning roadmap based on skill gaps.
        """
        all_gap_skills = missing_skills + moderate_skills
        if not all_gap_skills:
            all_gap_skills = ["Docker", "SQL", "Machine Learning"]

        priorities = []
        for idx, skill in enumerate(all_gap_skills[:3], start=1):
            s_clean = skill.strip().lower()
            cur_level = "Missing / Novice" if skill in missing_skills else "Moderate"
            tgt_level = "Industry Proficient"

            catalog_entry = None
            for key, val in self.CURRICULUM_CATALOG.items():
                if key in s_clean or s_clean in key:
                    catalog_entry = val
                    break

            if not catalog_entry:
                catalog_entry = {
                    "title": f"Mastery in {skill.title()}",
                    "topics": [
                        f"Core principles, syntax, and conventions of {skill.title()}",
                        f"Standard design patterns and architectural best practices in {skill.title()}",
                        f"Unit testing, benchmarking, and error-handling techniques",
                        f"Production deployment and integration into existing stacks"
                    ],
                    "project": f"Build an end-to-end working prototype demonstrating enterprise patterns with {skill.title()}."
                }

            priorities.append({
                "priority_level": idx,
                "skill_name": skill.title(),
                "current_level": cur_level,
                "target_level": tgt_level,
                "importance_reason": f"Crucial competency for {target_role}; closing this gap significantly elevates profile competitiveness.",
                "learning_modules": [
                    {
                        "module_title": catalog_entry["title"],
                        "recommended_topics": catalog_entry["topics"],
                        "practice_project_idea": catalog_entry["project"],
                        "estimated_weeks": 2 if cur_level == "Moderate" else 4
                    }
                ]
            })

        return {
            "candidate_id": candidate_id,
            "target_role": target_role,
            "priorities": priorities
        }

dev_plan_service = DevelopmentPlanService()
