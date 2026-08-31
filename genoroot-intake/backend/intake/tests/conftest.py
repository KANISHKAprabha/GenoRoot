import copy
import pytest


@pytest.fixture
def valid_male_submission():
    """A complete, schema-valid submission for a male patient —
    the baseline every mutation test starts from. Copy this dict
    (via the fixture args, not by importing it directly) and change
    exactly one field per test."""
    return {
        "sex": "Male",
        "personal_family": {
            "age_hair_loss_began": 28,
            "duration": "Over a year",
            "family_history": ["Father had hair loss"],
            "pattern": ["Thinning at crown"],
        },
        "hormonal_health": {
            "diagnosed_conditions": ["None"],
            "menstrual_cycle": None,
            "pregnancy_related": None,
            "adult_acne_oily_skin": False,
            "excess_body_facial_hair": False,
        },
        "lifestyle": {
            "past_6_months": [],
            "habits": {
                "smoking": False,
                "smoking_severity": None,
                "alcohol": False,
                "hard_water": False,
                "hair_wash_frequency": "Daily",
                "heating_tools_styling_chemicals": False,
                "salon_treatments": False,
                "salon_treatment_detail": None,
            },
        },
        "treatments": {
            "products": {
                "OTC/Medicated Shampoos": {"used": False},
                "Hair Oils/Serums": {"used": False},
                "Topical Minoxidil": {"used": False},
                "Oral Minoxidil": {"used": False},
                "Supplements": {"used": False},
            },
            "procedures": {
                "PRP/GFC/iPRF": {"done": False},
                "Stem Cells/Exosomes": {"done": False},
                "Hair Transplant": {"done": False},
                "Other": {"done": False, "other_detail": None},
            },
            "past_treatment_side_effects": False,
            "describe": None,
        },
        "sample_consent": {"sample_type": "Saliva", "consent": True},
    }


@pytest.fixture
def valid_female_submission(valid_male_submission):
    """Same base payload, but female — activates fields 6 & 7
    (menstrual_cycle, pregnancy_related)."""
    data = copy.deepcopy(valid_male_submission)
    data["sex"] = "Female"
    data["hormonal_health"]["menstrual_cycle"] = "Regular"
    data["hormonal_health"]["pregnancy_related"] = "Not applicable"
    return data