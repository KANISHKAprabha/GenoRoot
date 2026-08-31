"""
Covers SKILL.md Gap 1, Gap 2, Gap 3.

Gap 1 — sex gates menstrual_cycle (6) & pregnancy_related (7): required
        when Female, must be null when Male.
Gap 2 — adult_acne_oily_skin (8) & excess_body_facial_hair (9) are
        UNIVERSAL — never gated by sex or by diagnosed_conditions.
Gap 3 — mutual exclusion: "None" in diagnosed_conditions cannot coexist
        with any other selection.
"""
import copy
from intake.serializers import IntakeSubmissionSerializer


# ---------- Gap 1: sex gates 6 & 7 ----------

def test_male_with_menstrual_cycle_populated_fails(valid_male_submission):
    """A male patient must NOT have menstrual_cycle populated —
    this is the exact bug we caught earlier in this project."""
    data = copy.deepcopy(valid_male_submission)
    data["hormonal_health"]["menstrual_cycle"] = "Regular"

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "hormonal_health" in serializer.errors


def test_female_without_menstrual_cycle_fails(valid_female_submission):
    """A female patient MUST have menstrual_cycle populated."""
    data = copy.deepcopy(valid_female_submission)
    data["hormonal_health"]["menstrual_cycle"] = None

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "hormonal_health" in serializer.errors


def test_female_without_pregnancy_related_fails(valid_female_submission):
    data = copy.deepcopy(valid_female_submission)
    data["hormonal_health"]["pregnancy_related"] = None

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "hormonal_health" in serializer.errors


def test_valid_male_submission_passes(valid_male_submission):
    serializer = IntakeSubmissionSerializer(data=valid_male_submission)
    assert serializer.is_valid(), serializer.errors


def test_valid_female_submission_passes(valid_female_submission):
    serializer = IntakeSubmissionSerializer(data=valid_female_submission)
    assert serializer.is_valid(), serializer.errors


# ---------- Gap 2: fields 8 & 9 are universal ----------

def test_male_can_have_acne_flag_true_with_no_diagnosed_conditions(valid_male_submission):
    """Proves 8/9 are NOT gated behind PCOS/PCOD or sex — a male
    patient with 'None' selected for diagnosed_conditions can still
    validly report adult_acne_oily_skin=True."""
    data = copy.deepcopy(valid_male_submission)
    data["hormonal_health"]["diagnosed_conditions"] = ["None"]
    data["hormonal_health"]["adult_acne_oily_skin"] = True

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_excess_body_hair_true_without_pcos(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["hormonal_health"]["excess_body_facial_hair"] = True

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


# ---------- Gap 3: mutual exclusion on diagnosed_conditions ----------

def test_none_combined_with_other_condition_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["hormonal_health"]["diagnosed_conditions"] = ["None", "PCOS/PCOD"]

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "diagnosed_conditions" in str(serializer.errors)


def test_pcos_alone_passes(valid_female_submission):
    data = copy.deepcopy(valid_female_submission)
    data["hormonal_health"]["diagnosed_conditions"] = ["PCOS/PCOD"]

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_multiple_real_conditions_without_none_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["hormonal_health"]["diagnosed_conditions"] = ["Thyroid disorder", "Diabetes"]

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors