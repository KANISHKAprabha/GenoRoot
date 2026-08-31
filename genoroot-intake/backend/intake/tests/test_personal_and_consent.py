"""
Covers Section A (fields 1-4) and Section E (fields 15-16) — the two
sections not yet covered by test_hormonal_health.py, test_lifestyle.py,
or test_treatments.py.
"""
import copy
from intake.serializers import IntakeSubmissionSerializer


# ---------- Section A: age / duration ----------

def test_age_hair_loss_began_accepts_valid_int(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["age_hair_loss_began"] = 45

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_age_hair_loss_began_rejects_out_of_range(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["age_hair_loss_began"] = 150

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_duration_rejects_invalid_choice(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["duration"] = "5 years"  # not one of the 3 buckets

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


# ---------- Section A: family_history mutual exclusion (Gap 3 pattern, applied here too) ----------

def test_family_history_none_combined_with_real_selection_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["family_history"] = [
        "No known family history", "Father had hair loss"
    ]

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_family_history_multiple_real_selections_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["family_history"] = [
        "Father had hair loss", "Mother had hair loss"
    ]

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_family_history_empty_list_fails(valid_male_submission):
    """Unlike past_6_months, family_history has no 'confirmed empty'
    concept in the schema — every patient must select at least one
    option (including 'No known family history' itself)."""
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["family_history"] = []

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


# ---------- Section A: pattern (multi-select, no mutual exclusion needed — no "none" option) ----------

def test_pattern_multiple_selections_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["pattern"] = [
        "Receding hairline", "Diffuse thinning", "Sudden excessive shedding"
    ]

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_pattern_rejects_invalid_option(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["pattern"] = ["Complete baldness"]  # not in the enum

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_pattern_empty_list_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["personal_family"]["pattern"] = []

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


# ---------- Section E: consent hard rule ----------

def test_consent_false_fails_even_if_everything_else_valid(valid_male_submission):
    """Consent is never inferred, never optional — an otherwise
    perfectly valid submission must still fail overall if consent
    is False."""
    data = copy.deepcopy(valid_male_submission)
    data["sample_consent"]["consent"] = False

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_consent_true_with_valid_submission_passes(valid_male_submission):
    serializer = IntakeSubmissionSerializer(data=valid_male_submission)
    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["sample_consent"]["consent"] is True


def test_sample_type_rejects_invalid_choice(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["sample_consent"]["sample_type"] = "Hair follicle"  # not one of the 3 options

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_sample_type_each_valid_option_passes(valid_male_submission):
    for option in ["Saliva", "Blood", "Either"]:
        data = copy.deepcopy(valid_male_submission)
        data["sample_consent"]["sample_type"] = option

        serializer = IntakeSubmissionSerializer(data=data)
        assert serializer.is_valid(), (option, serializer.errors)