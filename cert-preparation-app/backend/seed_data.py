"""
Seed the database with official AZ-500 domains and skills from the study guide.
Run: python -m backend.seed_data
"""

from backend.database import engine, SessionLocal, Base
from backend.models import Domain, Skill


DOMAINS_AND_SKILLS = [
    {
        "name": "Manage identity and access",
        "weight_min": 15,
        "weight_max": 20,
        "skills": [
            ("IAM-01", "Manage Microsoft Entra identities"),
            ("IAM-02", "Manage Microsoft Entra authentication"),
            ("IAM-03", "Manage Microsoft Entra authorization"),
            ("IAM-04", "Manage Microsoft Entra application access"),
        ],
    },
    {
        "name": "Secure networking",
        "weight_min": 20,
        "weight_max": 25,
        "skills": [
            ("NET-01", "Plan and implement security for virtual networks"),
            ("NET-02", "Plan and implement security for private access to Azure resources"),
            ("NET-03", "Plan and implement security for public access to Azure resources"),
        ],
    },
    {
        "name": "Secure compute, storage, and databases",
        "weight_min": 20,
        "weight_max": 25,
        "skills": [
            ("CSD-01", "Plan and implement advanced security for compute"),
            ("CSD-02", "Plan and implement security for storage"),
            ("CSD-03", "Plan and implement security for Azure SQL Database and Azure SQL Managed Instance"),
        ],
    },
    {
        "name": "Manage security operations",
        "weight_min": 25,
        "weight_max": 30,
        "skills": [
            ("SEC-01", "Plan and implement governance for security"),
            ("SEC-02", "Manage security posture by using Microsoft Defender for Cloud"),
            ("SEC-03", "Configure and manage threat protection by using Microsoft Defender for Cloud"),
            ("SEC-04", "Configure and manage security monitoring and automation solutions"),
        ],
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Domain).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    for domain_data in DOMAINS_AND_SKILLS:
        domain = Domain(
            name=domain_data["name"],
            weight_min=domain_data["weight_min"],
            weight_max=domain_data["weight_max"],
        )
        db.add(domain)
        db.flush()  # Get domain.id

        for code, name in domain_data["skills"]:
            skill = Skill(domain_id=domain.id, name=name, code=code)
            db.add(skill)

    db.commit()
    print(f"Seeded {len(DOMAINS_AND_SKILLS)} domains with {sum(len(d['skills']) for d in DOMAINS_AND_SKILLS)} skills.")
    db.close()


if __name__ == "__main__":
    seed()
