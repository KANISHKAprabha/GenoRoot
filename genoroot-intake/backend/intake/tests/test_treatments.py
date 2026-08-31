"""
Covers SKILL.md Gap 7 and Gap 8, plus paired-null rules for every
products/procedures row.

Gap 7 — the yes/no half of past_treatment_side_effects (14) MAY be
        pre-filled from field 12's per-product side_effects flags (that's
        a frontend UX concern, not a backend rule) — but the 'describe'
        text must NEVER be fabricated, and the API itself places no
        required-pairing between past_treatment_side_effects and describe,
        since a patient may toggle Yes without wanting to elaborate.

Gap 8 — "Other" in procedures requires other_detail when done=True
        (disclosed schema addition — a 17th field, not a change to any
        of the 16).

Paired-null (products) — each of the 5 product rows: duration, helped,
        side_effects all required iff used=True, all null iff used=False.

Paired-null (procedures) — each of the 4 procedure rows: sessions,
        helped required iff done=True, null iff done=False. No
        side_effects column exists here (Gap 7 note — never use this
        section as an inference source for field 14).
"""
import copy
from intake.serializers import IntakeSubmissionSerializer


# ---------- Paired-null: products ----------

def test_product_used_true_missing_duration_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": True, "duration": None, "helped": True, "side_effects": False
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_product_used_true_missing_helped_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": True, "duration": "3-6mo", "helped": None, "side_effects": False
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_product_used_true_missing_side_effects_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": True, "duration": "3-6mo", "helped": True, "side_effects": None
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_product_used_false_with_duration_populated_fails(valid_male_submission):
    """Guards against stale data if a product is deselected after
    being filled in."""
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": False, "duration": "3-6mo", "helped": None, "side_effects": None
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_product_used_false_with_helped_populated_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": False, "duration": None, "helped": True, "side_effects": None
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_product_used_true_fully_populated_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": True, "duration": "3-6mo", "helped": True, "side_effects": False
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_product_unselected_stays_valid(valid_male_submission):
    """Baseline: every product defaulted to used=False in the fixture
    must remain a valid, complete entry on its own."""
    serializer = IntakeSubmissionSerializer(data=valid_male_submission)
    assert serializer.is_valid(), serializer.errors


def test_products_missing_a_required_row_fails(valid_male_submission):
    """Every one of the 5 product keys must be present — dropping one
    entirely (not just marking it unused) should fail."""
    data = copy.deepcopy(valid_male_submission)
    del data["treatments"]["products"]["Supplements"]

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


# ---------- Paired-null: procedures ----------

def test_procedure_done_true_missing_sessions_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["procedures"]["PRP/GFC/iPRF"] = {
        "done": True, "sessions": None, "helped": True
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_procedure_done_true_missing_helped_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["procedures"]["PRP/GFC/iPRF"] = {
        "done": True, "sessions": "1-3", "helped": None
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_procedure_done_false_with_sessions_populated_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["procedures"]["PRP/GFC/iPRF"] = {
        "done": False, "sessions": "1-3", "helped": None
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


def test_procedure_done_true_fully_populated_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["procedures"]["PRP/GFC/iPRF"] = {
        "done": True, "sessions": "4-6", "helped": True
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_procedures_missing_a_required_row_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    del data["treatments"]["procedures"]["Hair Transplant"]

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()


# ---------- Gap 8: "Other" procedure requires other_detail ----------

def test_other_done_true_without_detail_fails(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["procedures"]["Other"] = {
        "done": True, "sessions": "1-3", "helped": True, "other_detail": None
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert not serializer.is_valid()
    assert "Other" in str(serializer.errors) or "other_detail" in str(serializer.errors)


def test_other_done_true_with_detail_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["procedures"]["Other"] = {
        "done": True, "sessions": "1-3", "helped": True,
        "other_detail": "Scalp micropigmentation"
    }

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_other_done_false_stays_valid(valid_male_submission):
    """Baseline: Other not done, no detail — must be valid as-is."""
    serializer = IntakeSubmissionSerializer(data=valid_male_submission)
    assert serializer.is_valid(), serializer.errors


# ---------- Gap 7: past_treatment_side_effects / describe ----------

def test_side_effects_true_without_describe_passes(valid_male_submission):
    """A patient can toggle Yes without wanting to elaborate — describe
    is optional even when the toggle is True. Do not force a pairing
    here the way we do for smoking/salon."""
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["past_treatment_side_effects"] = True
    data["treatments"]["describe"] = None

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_side_effects_true_with_describe_passes(valid_male_submission):
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["past_treatment_side_effects"] = True
    data["treatments"]["describe"] = "Mild scalp irritation for the first week"

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


def test_side_effects_false_with_describe_populated(valid_male_submission):
    """Not explicitly forbidden by the schema — a patient might still
    want to note something even if they said 'No' overall. Documenting
    current behavior: this passes. Flag in SKILL.md if you'd rather
    forbid it outright."""
    data = copy.deepcopy(valid_male_submission)
    data["treatments"]["past_treatment_side_effects"] = False
    data["treatments"]["describe"] = "Nothing serious, just noting a mild itch"

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


# ---------- Integration: full valid submission with treatments populated ----------

def test_full_submission_with_multiple_products_and_procedures_passes(valid_female_submission):
    """A realistic, fuller payload — multiple products used, one
    procedure done, Other procedure with detail, side effects flagged
    with a description. Proves the whole TreatmentsSerializer composes
    correctly end to end, not just field by field."""
    data = copy.deepcopy(valid_female_submission)
    data["treatments"]["products"]["Topical Minoxidil"] = {
        "used": True, "duration": "3-6mo", "helped": True, "side_effects": True
    }
    data["treatments"]["products"]["OTC/Medicated Shampoos"] = {
        "used": True, "duration": ">6mo", "helped": False, "side_effects": False
    }
    data["treatments"]["procedures"]["PRP/GFC/iPRF"] = {
        "done": True, "sessions": "1-3", "helped": True
    }
    data["treatments"]["procedures"]["Other"] = {
        "done": True, "sessions": "1-3", "helped": False,
        "other_detail": "LED light therapy"
    }
    data["treatments"]["past_treatment_side_effects"] = True
    data["treatments"]["describe"] = "Some scalp dryness with minoxidil"

    serializer = IntakeSubmissionSerializer(data=data)
    assert serializer.is_valid(), serializer.errors