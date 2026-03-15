"""
Multi-certification integrity tests.
Validates that both AZ-500 and CEH certifications work correctly:
database, materials, API endpoints, flashcards.

Run: python -m pytest tests/test_multi_cert_integrity.py -v
"""
import os
import sys
import json
import unittest
from pathlib import Path
from unittest.mock import patch

# Setup environment before any app imports
os.environ.setdefault("ENVIRONMENT", "local")
os.environ.setdefault("ENTRA_TENANT_ID", "c0531484-50fa-4ff2-97df-b1f2d4810603")
os.environ.setdefault("ENTRA_CLIENT_ID", "local-dev-client-id")
os.environ.setdefault("ENTRA_CLIENT_SECRET", "local-dev-client-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./az500_local.db")

APP_ROOT = Path(__file__).resolve().parent.parent

# Try importing main — may fail due to MSAL auth in test environments
_main_available = False
try:
    from backend import main as _main_module
    _main_available = True
except (ValueError, ImportError):
    pass


class TestDatabaseIntegrity(unittest.TestCase):
    """Test that the seed database exists and contains expected data."""

    def setUp(self):
        from backend.database import SessionLocal, init_db
        init_db()
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_seed_db_exists(self):
        """Seed database file must exist."""
        from backend.config import BUNDLED_DATABASE_PATH
        self.assertTrue(BUNDLED_DATABASE_PATH.exists(),
                        f"Seed DB not found at {BUNDLED_DATABASE_PATH}")

    def test_both_certifications_exist(self):
        """Both AZ-500 and CEH must exist in certifications table."""
        from backend.models import Certification
        certs = {c.code for c in self.db.query(Certification).all()}
        self.assertIn("AZ-500", certs)
        self.assertIn("CEH", certs)

    def test_az500_has_questions(self):
        """AZ-500 must have questions in the database."""
        from backend.models import Question, Certification
        cert = self.db.query(Certification).filter_by(code="AZ-500").first()
        count = self.db.query(Question).filter_by(certification_id=cert.id).count()
        self.assertGreater(count, 400, f"AZ-500 has only {count} questions, expected >400")

    def test_ceh_has_questions(self):
        """CEH must have questions in the database."""
        from backend.models import Question, Certification
        cert = self.db.query(Certification).filter_by(code="CEH").first()
        count = self.db.query(Question).filter_by(certification_id=cert.id).count()
        self.assertGreater(count, 570, f"CEH has only {count} questions, expected >570")

    def test_az500_has_domains(self):
        """AZ-500 must have domains."""
        from backend.models import Domain, Certification
        cert = self.db.query(Certification).filter_by(code="AZ-500").first()
        count = self.db.query(Domain).filter_by(certification_id=cert.id).count()
        self.assertGreater(count, 0, "AZ-500 has no domains")

    def test_ceh_has_9_domains(self):
        """CEH must have 9 domains per exam blueprint."""
        from backend.models import Domain, Certification
        cert = self.db.query(Certification).filter_by(code="CEH").first()
        count = self.db.query(Domain).filter_by(certification_id=cert.id).count()
        self.assertEqual(count, 9, f"CEH has {count} domains, expected 9")

    def test_ceh_has_flashcards(self):
        """CEH must have flashcards."""
        from backend.models import Flashcard, Certification
        cert = self.db.query(Certification).filter_by(code="CEH").first()
        count = self.db.query(Flashcard).filter_by(certification_id=cert.id).count()
        self.assertGreater(count, 300, f"CEH has only {count} flashcards, expected >300")

    def test_az500_has_flashcards(self):
        """AZ-500 must have flashcards."""
        from backend.models import Flashcard, Certification
        cert = self.db.query(Certification).filter_by(code="AZ-500").first()
        count = self.db.query(Flashcard).filter_by(certification_id=cert.id).count()
        self.assertGreater(count, 200, f"AZ-500 has only {count} flashcards, expected >200")

    def test_ceh_questions_have_explanations(self):
        """CEH questions must have JSON-format explanations."""
        from backend.models import Question, QuestionTranslation, Certification
        cert = self.db.query(Certification).filter_by(code="CEH").first()
        qt = (self.db.query(QuestionTranslation)
              .join(Question)
              .filter(Question.certification_id == cert.id)
              .first())
        self.assertIsNotNone(qt.explanation)
        expl = json.loads(qt.explanation)
        self.assertIn("text", expl)
        self.assertIn("exam_traps", expl)
        self.assertIn("why_incorrect", expl)

    def test_ceh_mock_exam_config(self):
        """CEH certification must have 240 min duration."""
        from backend.models import Certification
        cert = self.db.query(Certification).filter_by(code="CEH").first()
        self.assertEqual(cert.duration_minutes, 240)

    def test_az500_mock_exam_config(self):
        """AZ-500 certification must have 150 min duration."""
        from backend.models import Certification
        cert = self.db.query(Certification).filter_by(code="AZ-500").first()
        self.assertEqual(cert.duration_minutes, 150)


class TestMaterialFiles(unittest.TestCase):
    """Test that study material files exist for both certifications."""

    MATERIALS_ROOT = APP_ROOT / "learning_materials"
    # Fallback to old path if new doesn't exist yet (pre-refactoring)
    if not MATERIALS_ROOT.exists():
        MATERIALS_ROOT = APP_ROOT / "Claude_skany_materiały" / "Materiały do nauki - notion"

    def test_materials_root_exists(self):
        """Materials root directory must exist."""
        self.assertTrue(self.MATERIALS_ROOT.is_dir(),
                        f"Materials root not found: {self.MATERIALS_ROOT}")

    def test_ceh_materials_exist(self):
        """CEH study materials (7 day files) must exist."""
        ceh_dir = self.MATERIALS_ROOT / "CEH"
        self.assertTrue(ceh_dir.is_dir(), f"CEH materials dir missing: {ceh_dir}")
        for day in range(1, 8):
            path = ceh_dir / f"CEH_Day{day}_Study_Material.md"
            self.assertTrue(path.exists(), f"CEH day {day} file missing: {path}")

    def test_az500_materials_exist(self):
        """AZ-500 study materials must exist."""
        # Check both old location (root) and new location (AZ-500 subdir)
        found = 0
        for day in range(1, 7):
            old_path = self.MATERIALS_ROOT / f"AZ-500_Day{day}_Study_Material_Solution.md"
            new_path = self.MATERIALS_ROOT / "AZ-500" / f"AZ-500_Day{day}_Study_Material_Solution.md"
            if old_path.exists() or new_path.exists():
                found += 1
        self.assertGreaterEqual(found, 6, f"Only {found}/6 AZ-500 day files found")

    def test_ceh_cheatsheet_exists(self):
        """CEH cheatsheet file must exist."""
        path = self.MATERIALS_ROOT / "CEH" / "CEH_Cheatsheet.md"
        self.assertTrue(path.exists(), f"CEH cheatsheet missing: {path}")

    def test_ceh_materials_not_empty(self):
        """CEH day 1 material must have substantial content."""
        path = self.MATERIALS_ROOT / "CEH" / "CEH_Day1_Study_Material.md"
        size = path.stat().st_size
        self.assertGreater(size, 10000, f"CEH day 1 is too small ({size} bytes)")

    def test_ceh_cheatsheet_not_empty(self):
        """CEH cheatsheet must have substantial content."""
        path = self.MATERIALS_ROOT / "CEH" / "CEH_Cheatsheet.md"
        size = path.stat().st_size
        self.assertGreater(size, 50000, f"CEH cheatsheet too small ({size} bytes)")


@unittest.skipUnless(_main_available, "backend.main import fails in test env (MSAL auth)")
class TestCertificationCatalog(unittest.TestCase):
    """Test the certification catalog configuration."""

    def test_ceh_in_catalog(self):
        """CEH must be in the certification catalog."""
        from backend.main import CERTIFICATION_CATALOG
        slugs = {c["certification_slug"] for c in CERTIFICATION_CATALOG}
        self.assertIn("ceh", slugs)

    def test_az500_in_catalog(self):
        """AZ-500 must be in the certification catalog."""
        from backend.main import CERTIFICATION_CATALOG
        slugs = {c["certification_slug"] for c in CERTIFICATION_CATALOG}
        self.assertIn("az-500", slugs)

    def test_ceh_is_unpublished(self):
        """CEH must be unpublished (hidden from users in cert-preparation-app)."""
        from backend.main import CERTIFICATION_CATALOG
        ceh = next(c for c in CERTIFICATION_CATALOG if c["certification_slug"] == "ceh")
        self.assertFalse(ceh["is_published"])

    def test_material_day_titles_per_cert(self):
        """MATERIAL_DAY_TITLES must have entries for both certifications."""
        from backend.main import MATERIAL_DAY_TITLES
        self.assertIn("az-500", MATERIAL_DAY_TITLES)
        self.assertIn("ceh", MATERIAL_DAY_TITLES)
        self.assertEqual(len(MATERIAL_DAY_TITLES["az-500"]), 7)
        self.assertEqual(len(MATERIAL_DAY_TITLES["ceh"]), 7)

    def test_no_hardcoded_az500_in_i18n(self):
        """i18n files must not have hardcoded AZ-500 in learning title."""
        en_path = APP_ROOT / "frontend" / "static" / "i18n" / "en.json"
        with open(en_path) as f:
            data = json.load(f)
        learning_title = data.get("learning", {}).get("title", "")
        self.assertNotIn("AZ-500", learning_title,
                         "learning.title still contains hardcoded AZ-500")


class TestMockExamConfig(unittest.TestCase):
    """Test per-certification mock exam configuration."""

    def test_mock_exam_config_in_js(self):
        """app.js must have MOCK_EXAM_CONFIG with both certifications."""
        js_path = APP_ROOT / "frontend" / "static" / "js" / "app.js"
        with open(js_path) as f:
            content = f.read()
        self.assertIn("MOCK_EXAM_CONFIG", content)
        self.assertIn("'CEH'", content)
        self.assertIn("'AZ-500'", content)
        self.assertIn("questions: 125", content)  # CEH
        self.assertIn("minutes: 240", content)    # CEH
        self.assertIn("questions: 60", content)    # AZ-500
        self.assertIn("minutes: 150", content)     # AZ-500

    def test_study_plan_has_both_certs(self):
        """study_plan.js must have STUDY_PLANS with both certifications."""
        js_path = APP_ROOT / "frontend" / "static" / "js" / "study_plan.js"
        with open(js_path) as f:
            content = f.read()
        self.assertIn('"AZ-500"', content)
        self.assertIn('"CEH"', content)


class TestFlashcardRouter(unittest.TestCase):
    """Test flashcard API router exists and is registered."""

    def test_flashcard_router_file_exists(self):
        """Flashcard router module must exist."""
        path = APP_ROOT / "backend" / "routers" / "flashcards.py"
        self.assertTrue(path.exists())

    def test_flashcard_models_exist(self):
        """Flashcard and FlashcardMastery models must exist."""
        from backend.models import Flashcard, FlashcardMastery
        self.assertTrue(hasattr(Flashcard, "__tablename__"))
        self.assertTrue(hasattr(FlashcardMastery, "__tablename__"))
        self.assertEqual(Flashcard.__tablename__, "flashcards")
        self.assertEqual(FlashcardMastery.__tablename__, "flashcard_mastery")

    def test_flashcard_template_exists(self):
        """Flashcards HTML template must exist."""
        path = APP_ROOT / "frontend" / "templates" / "flashcards.html"
        self.assertTrue(path.exists())

    def test_flashcard_js_exists(self):
        """Flashcards JS file must exist."""
        path = APP_ROOT / "frontend" / "static" / "js" / "flashcards.js"
        self.assertTrue(path.exists())

    def test_flashcards_in_sidebar(self):
        """Flashcards link must be in the sidebar navigation."""
        path = APP_ROOT / "frontend" / "templates" / "base.html"
        with open(path) as f:
            content = f.read()
        self.assertIn("nav-flashcards", content)
        self.assertIn("Flashcards", content)


if __name__ == "__main__":
    unittest.main()
