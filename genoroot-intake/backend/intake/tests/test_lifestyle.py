"""
Covers SKILL.md Gap 4, plus the smoking/salon paired-null rules from
the Habits section, plus a smoke test for hard_water (no branching
logic to verify — just confirms the field is wired up correctly).

Gap 4 — past_6_months has no explicit "None" enum value in the ORIGINAL
        schema at the field-10 level; "None of these apply" was added as
        a disclosed schema addition. Either way, an empty list must be
        a VALID answer, not rejected — that's what distinguishes an
        intentional "nothing applies" from an unanswered question
        (the touched-flag distinction lives in the frontend; the API
        only ever sees the resulting array).

Paired-null (smoking) — smoking_severity required iff smoking=True,
        must be null iff smoking=False.
Paired-null (salon) — salon_treatment_detail required iff
        salon_treatments=True, must be null iff salon_treatments=False.

Note: tests that check DRF's own built-in validation messages (invalid
choice, invalid boolean type) assert only `not serializer.is_valid()`,
not the specific error text — those built-in messages are wrapped in
Django's lazy translation objects, and forcing str() on them can raise
an ImproperlyConfigured error depending on environment/app-registry
timing. Custom messages we wrote ourselves (in the section serializers'
validate() methods) are plain strings and are safe to check with
str(serializer.errors).
"""
import copy
from intake.serializers import IntakeSubmissionSerializer


# ---------- Gap 4: past_6_months empty list is valid ----------

def test_past_6_months_empty_list_passes(valid_male_submission):
    """An empty list means 'patient confirmed none of these apply' —
    this must NOT be rejected as missing/incomplete."""
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["past_6_months"] = []

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_past_6_months_with_selections_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["past_6_months"] = [
        "High stress or emotional trauma",
        "Crash dieting or major weight loss",
    ]

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_past_6_months_rejects_invalid_option(valid_male_submission):
    """Guards against typos/invalid values slipping through — not an
    enumerated option, should fail."""
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["past_6_months"] = ["Something not in the schema"]

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


# ---------- Paired-null: smoking / smoking_severity ----------

def test_smoking_true_without_severity_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["smoking"] = True
    data["lifestyle"]["habits"]["smoking_severity"] = None

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "smoking_severity" in str(serializer.errors)


def test_smoking_false_with_severity_populated_fails(valid_male_submission):
    """Guards against stale data — if smoking is toggled back to No,
    severity must be cleared, not left over from a previous Yes."""
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["smoking"] = False
    data["lifestyle"]["habits"]["smoking_severity"] = "Moderate 5-10/day"

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "smoking_severity" in str(serializer.errors)


def test_smoking_true_with_severity_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["smoking"] = True
    data["lifestyle"]["habits"]["smoking_severity"] = "Severe >10/day"

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


# ---------- Paired-null: salon_treatments / salon_treatment_detail ----------

def test_salon_true_without_detail_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["salon_treatments"] = True
    data["lifestyle"]["habits"]["salon_treatment_detail"] = None

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "salon_treatment_detail" in str(serializer.errors)


def test_salon_false_with_detail_populated_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["salon_treatments"] = False
    data["lifestyle"]["habits"]["salon_treatment_detail"] = "Keratin treatment"

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "salon_treatment_detail" in str(serializer.errors)


def test_salon_true_with_detail_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["salon_treatments"] = True
    data["lifestyle"]["habits"]["salon_treatment_detail"] = "Rebonding"

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


# ---------- Smoke test: hard_water (no branching logic to verify) ----------

def test_hard_water_accepts_true(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["hard_water"] = True

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_hard_water_accepts_false(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["hard_water"] = False

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_hard_water_rejects_non_bool(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["hard_water"] = "maybe"

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()