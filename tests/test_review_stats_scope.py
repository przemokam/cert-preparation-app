import os
import sys
import tempfile
import types
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

TEST_DIR = tempfile.TemporaryDirectory(prefix="review-stats-scope-")
DB_PATH = Path(TEST_DIR.name) / "scope-test.db"

os.environ.setdefault("ENVIRONMENT", "local")
os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH}"
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("ENTRA_CLIENT_ID", "test-client-id")
os.environ.setdefault("ENTRA_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("ENTRA_TENANT_ID", "test-tenant")
os.environ.setdefault("REDIRECT_URI", "http://localhost/auth/callback")


class _FakeMsalClient:
    def __init__(self, *args, **kwargs):
        pass

    def get_authorization_request_url(self, *args, **kwargs):
        return "https://example.test/login"


sys.modules.setdefault("msal", types.SimpleNamespace(ConfidentialClientApplication=_FakeMsalClient))

from fastapi.testclient import TestClient

from backend.auth import create_session_token
from backend.database import SessionLocal, init_db
from backend.main import ACTIVE_CERT_COOKIE, app
from backend.models import (
    Certification,
    Domain,
    ExamSession,
    Question,
    QuestionMastery,
    QuestionSkill,
    ReviewPoolItem,
    Skill,
    User,
    UserAnswer,
)


def seed_scope_data():
    init_db()
    db = SessionLocal()
    if db.query(User).count():
        db.close()
        return

    now = datetime.now(timezone.utc)
    user = User(id="user-1", entra_oid="oid-1", email="user@example.com", display_name="Scope Tester")
    az500 = Certification(code="AZ-500", name="Azure Security Engineer", provider="Microsoft")
    sc200 = Certification(code="SC-200", name="Security Operations Analyst", provider="Microsoft")
    db.add_all([user, az500, sc200])
    db.flush()

    az_domain = Domain(certification_id=az500.id, name="Identity", weight_min=20, weight_max=25)
    sc_domain = Domain(certification_id=sc200.id, name="Defender", weight_min=20, weight_max=25)
    db.add_all([az_domain, sc_domain])
    db.flush()

    az_skill = Skill(domain_id=az_domain.id, name="Manage Entra ID", code="AZ500-IDENTITY")
    sc_skill = Skill(domain_id=sc_domain.id, name="Investigate incidents", code="SC200-DEFENDER")
    db.add_all([az_skill, sc_skill])
    db.flush()

    questions = [
        Question(certification_id=az500.id, question_type="single_choice", correct_answer=["A"], source_question_number=1),
        Question(certification_id=az500.id, question_type="single_choice", correct_answer=["A"], source_question_number=2),
        Question(certification_id=sc200.id, question_type="single_choice", correct_answer=["A"], source_question_number=1),
        Question(certification_id=sc200.id, question_type="single_choice", correct_answer=["A"], source_question_number=2),
    ]
    db.add_all(questions)
    db.flush()

    db.add_all([
        QuestionSkill(question_id=questions[0].id, skill_id=az_skill.id),
        QuestionSkill(question_id=questions[1].id, skill_id=az_skill.id),
        QuestionSkill(question_id=questions[2].id, skill_id=sc_skill.id),
        QuestionSkill(question_id=questions[3].id, skill_id=sc_skill.id),
    ])

    az_exam = ExamSession(
        id="exam-az", user_id=user.id, certification_id=az500.id, mode="mock_exam", status="completed",
        question_ids=[questions[0].id, questions[1].id], score=720, started_at=now - timedelta(hours=2), completed_at=now - timedelta(hours=1)
    )
    sc_exam = ExamSession(
        id="exam-sc", user_id=user.id, certification_id=sc200.id, mode="mock_exam", status="completed",
        question_ids=[questions[2].id, questions[3].id], score=610, started_at=now - timedelta(days=1, hours=2), completed_at=now - timedelta(days=1, hours=1)
    )
    db.add_all([az_exam, sc_exam])

    db.add_all([
        UserAnswer(session_id="exam-az", question_id=questions[0].id, user_response=["A"], is_correct=True),
        UserAnswer(session_id="exam-az", question_id=questions[1].id, user_response=["B"], is_correct=False),
        UserAnswer(session_id="exam-sc", question_id=questions[2].id, user_response=["B"], is_correct=False),
        UserAnswer(session_id="exam-sc", question_id=questions[3].id, user_response=["B"], is_correct=False),
    ])
    db.add_all([
        ReviewPoolItem(user_id=user.id, question_id=questions[1].id, source="mock_exam_error", times_failed=1),
        ReviewPoolItem(user_id=user.id, question_id=questions[2].id, source="manual_bookmark", times_failed=2),
    ])
    db.add_all([
        QuestionMastery(user_id=user.id, question_id=questions[0].id, box=4, times_correct=1, last_answered_at=now),
        QuestionMastery(user_id=user.id, question_id=questions[1].id, box=1, times_incorrect=1, last_answered_at=now),
        QuestionMastery(user_id=user.id, question_id=questions[2].id, box=1, times_incorrect=1, last_answered_at=now),
        QuestionMastery(user_id=user.id, question_id=questions[3].id, box=1, times_incorrect=1, last_answered_at=now),
    ])
    db.commit()
    db.close()


class ReviewStatsScopeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_scope_data()
        cls.client = TestClient(app)
        cls.client.cookies.set("session_token", create_session_token("user-1", "user@example.com"))
        cls.client.cookies.set(ACTIVE_CERT_COOKIE, "az-500")

    def test_review_and_stats_routes_canonicalize_scope(self):
        review_redirect = self.client.get("/review", follow_redirects=False)
        self.assertEqual(review_redirect.status_code, 302)
        self.assertEqual(review_redirect.headers["location"], "/review?scope=active&cert=az-500")

        review_all = self.client.get("/review?scope=all&cert=az-500", follow_redirects=False)
        self.assertEqual(review_all.headers["location"], "/review?scope=all")

        stats_redirect = self.client.get("/stats", follow_redirects=False)
        self.assertEqual(stats_redirect.status_code, 302)
        self.assertEqual(stats_redirect.headers["location"], "/stats?scope=active&cert=az-500")

    def test_review_pool_filters_between_active_and_all(self):
        active = self.client.get("/api/analytics/review-pool?certification_code=AZ-500").json()
        self.assertEqual(active["total"], 1)
        self.assertEqual({item["certification_code"] for item in active["items"]}, {"AZ-500"})

        combined = self.client.get("/api/analytics/review-pool").json()
        self.assertEqual(combined["total"], 2)
        self.assertEqual({item["certification_code"] for item in combined["items"]}, {"AZ-500", "SC-200"})

    def test_stats_endpoints_filter_between_active_and_all(self):
        stats_active = self.client.get("/api/analytics/stats?certification_code=AZ-500").json()
        self.assertEqual(stats_active["total_answered"], 2)
        self.assertEqual(stats_active["accuracy"], 50)
        self.assertEqual([d["certification_code"] for d in stats_active["domains"]], ["AZ-500"])

        stats_all = self.client.get("/api/analytics/stats").json()
        self.assertEqual(stats_all["total_answered"], 4)
        self.assertEqual({d["certification_code"] for d in stats_all["domains"]}, {"AZ-500", "SC-200"})

        mastery_active = self.client.get("/api/analytics/mastery?certification_code=AZ-500").json()
        self.assertEqual([d["certification_code"] for d in mastery_active["domains"]], ["AZ-500"])

        weak_spots_active = self.client.get("/api/analytics/weak-spots?certification_code=AZ-500").json()
        self.assertEqual({spot["certification_code"] for spot in weak_spots_active["weak_spots"]}, {"AZ-500"})

        history_active = self.client.get("/api/exam/history?certification_code=AZ-500").json()
        self.assertEqual(len(history_active["history"]), 1)
        self.assertEqual(history_active["history"][0]["certification_code"], "AZ-500")

        history_all = self.client.get("/api/exam/history").json()
        self.assertEqual({exam["certification_code"] for exam in history_all["history"]}, {"AZ-500", "SC-200"})

    def test_scope_templates_render_explicit_modes(self):
        review_page = self.client.get("/review?scope=all")
        self.assertIn('id="review-page" data-scope="all"', review_page.text)
        self.assertIn('id="btn-start-review" disabled', review_page.text)

        stats_page = self.client.get("/stats?scope=active&cert=az-500")
        self.assertIn('id="stats-page" data-scope="active"', stats_page.text)
        self.assertIn('/stats?scope=all', stats_page.text)


if __name__ == "__main__":
    unittest.main()