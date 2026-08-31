# GenoRoot Hair & Scalp Intake — DRF serializers
#
# One serializer per section, mirroring the interaction map in SKILL.md,
# composed into IntakeSubmissionSerializer. Every validate() below
# corresponds to a numbered "Gap" in SKILL.md — check there first if a
# rule looks unfamiliar or needs to change.
#
# Validation lives here (Python), NOT as Postgres CHECK constraints.

from rest_framework import serializers


# ---------- Section A ----------
class PersonalFamilySerializer(serializers.Serializer):
    age_hair_loss_began = serializers.IntegerField(min_value=1, max_value=100)
    duration = serializers.ChoiceField(
        choices=["Less than 6 months", "6-12 months", "Over a year"]
    )
    family_history = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "Father had hair loss", "Mother had hair loss",
            "Siblings with thinning or baldness", "No known family history"
        ]),
        allow_empty=False
    )
    pattern = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "Receding hairline", "Thinning at crown", "Widening part line",
            "Diffuse thinning", "Patchy loss", "Sudden excessive shedding"
        ]),
        allow_empty=False
    )

    def validate_family_history(self, value):
        # Gap 3: mutual exclusion on "none"-style multi-selects
        if "No known family history" in value and len(value) > 1:
            raise serializers.ValidationError(
                "'No known family history' cannot be combined with other selections."
            )
        return value


# ---------- Section B ----------
class HormonalHealthSerializer(serializers.Serializer):
    diagnosed_conditions = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "PCOS/PCOD", "Thyroid disorder", "Diabetes",
            "Autoimmune disease", "Anemia", "None"
        ]),
        allow_empty=False
    )
    # femaleOnly fields (Gap 1) — required only when sex == "Female",
    # enforced in the parent serializer where `sex` is in scope.
    menstrual_cycle = serializers.ChoiceField(
        choices=["Regular", "Irregular", "Menopausal", "Not applicable"],
        required=False, allow_null=True
    )
    pregnancy_related = serializers.ChoiceField(
        choices=["Currently pregnant", "Postpartum <1 year", "Not applicable"],
        required=False, allow_null=True
    )
    # Universal fields (Gap 2) — never gated by sex or diagnosed_conditions.
    adult_acne_oily_skin = serializers.BooleanField()
    excess_body_facial_hair = serializers.BooleanField()

    def validate_diagnosed_conditions(self, value):
        # Gap 3: mutual exclusion
        if "None" in value and len(value) > 1:
            raise serializers.ValidationError(
                "'None' cannot be combined with other conditions."
            )
        return value


# ---------- Section C ----------
class HabitsSerializer(serializers.Serializer):
    smoking = serializers.BooleanField()
    smoking_severity = serializers.ChoiceField(
        choices=["Mild <5/day", "Moderate 5-10/day", "Severe >10/day"],
        required=False, allow_null=True
    )
    alcohol = serializers.BooleanField()
    hard_water = serializers.BooleanField()
    hair_wash_frequency = serializers.ChoiceField(
        choices=["Daily", "Alternate Days", "Weekly"]
    )
    heating_tools_styling_chemicals = serializers.BooleanField()  # kept compound — Gap 5
    salon_treatments = serializers.BooleanField()
    salon_treatment_detail = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=200
    )

    def validate(self, data):
        # Toggle-to-No / paired-null rule (see SKILL.md)
        if data["smoking"] and not data.get("smoking_severity"):
            raise serializers.ValidationError(
                {"smoking_severity": "Required when smoking is true."}
            )
        if not data["smoking"] and data.get("smoking_severity"):
            raise serializers.ValidationError(
                {"smoking_severity": "Must be null when smoking is false."}
            )
        if data["salon_treatments"] and not data.get("salon_treatment_detail"):
            raise serializers.ValidationError(
                {"salon_treatment_detail": "Required when salon_treatments is true."}
            )
        if not data["salon_treatments"] and data.get("salon_treatment_detail"):
            raise serializers.ValidationError(
                {"salon_treatment_detail": "Must be null when salon_treatments is false."}
            )
        return data


class LifestyleSerializer(serializers.Serializer):
    past_6_months = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "Crash dieting or major weight loss",
            "High stress or emotional trauma",
            "Fever with illness (COVID, Dengue, Typhoid)",
            "Recent surgery",
            "Change in location/water/air quality",
        ]),
        allow_empty=True
        # Gap 4: empty list = "None of these apply", confirmed via a
        # touched flag at the UI layer before submission — the API only
        # sees the resulting array, empty or not.
    )
    habits = HabitsSerializer()


# ---------- Section D ----------
class ProductEntrySerializer(serializers.Serializer):
    used = serializers.BooleanField()
    duration = serializers.ChoiceField(
        choices=["<3mo", "3-6mo", ">6mo"], required=False, allow_null=True
    )
    helped = serializers.BooleanField(required=False, allow_null=True)
    side_effects = serializers.BooleanField(required=False, allow_null=True)

    def validate(self, data):
        detail_fields = ["duration", "helped", "side_effects"]
        if data["used"]:
            missing = [f for f in detail_fields if data.get(f) is None]
            if missing:
                raise serializers.ValidationError(
                    f"Required when used is true: {missing}"
                )
        else:
            populated = [f for f in detail_fields if data.get(f) is not None]
            if populated:
                raise serializers.ValidationError(
                    f"Must be null when used is false: {populated}"
                )
        return data


class ProcedureEntrySerializer(serializers.Serializer):
    done = serializers.BooleanField()
    sessions = serializers.ChoiceField(
        choices=["1-3", "4-6", ">6"], required=False, allow_null=True
    )
    helped = serializers.BooleanField(required=False, allow_null=True)
    other_detail = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=200
    )  # Gap 8: only populated on the "Other" row

    def validate(self, data):
        if data["done"]:
            if data.get("sessions") is None or data.get("helped") is None:
                raise serializers.ValidationError(
                    "sessions and helped are required when done is true."
                )
        else:
            if data.get("sessions") is not None or data.get("helped") is not None:
                raise serializers.ValidationError(
                    "sessions and helped must be null when done is false."
                )
        return data


class TreatmentsSerializer(serializers.Serializer):
    products = serializers.DictField(child=ProductEntrySerializer())
    procedures = serializers.DictField(child=ProcedureEntrySerializer())
    past_treatment_side_effects = serializers.BooleanField()  # Gap 7: pre-fillable, never the describe text
    describe = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, max_length=500
    )

    def validate_products(self, value):
        expected_keys = {
            "OTC/Medicated Shampoos", "Hair Oils/Serums",
            "Topical Minoxidil", "Oral Minoxidil", "Supplements"
        }
        if set(value.keys()) != expected_keys:
            raise serializers.ValidationError(f"products must contain exactly: {expected_keys}")
        return value

    def validate_procedures(self, value):
        expected_keys = {"PRP/GFC/iPRF", "Stem Cells/Exosomes", "Hair Transplant", "Other"}
        if set(value.keys()) != expected_keys:
            raise serializers.ValidationError(f"procedures must contain exactly: {expected_keys}")
        other = value.get("Other", {})
        if other.get("done") and not other.get("other_detail"):
            raise serializers.ValidationError(
                {"Other": "other_detail is required when the 'Other' row is done."}
            )
        return value


# ---------- Section E ----------
class SampleConsentSerializer(serializers.Serializer):
    sample_type = serializers.ChoiceField(choices=["Saliva", "Blood", "Either"])
    consent = serializers.BooleanField()

    def validate_consent(self, value):
        if value is not True:
            raise serializers.ValidationError("Consent must be explicitly given to submit.")
        return value


# ---------- Top-level: entire submission ----------
class IntakeSubmissionSerializer(serializers.Serializer):
    sex = serializers.ChoiceField(choices=["Male", "Female"])  # Gap 1: meta field, outside the 16
    personal_family = PersonalFamilySerializer()
    hormonal_health = HormonalHealthSerializer()
    lifestyle = LifestyleSerializer()
    treatments = TreatmentsSerializer()
    sample_consent = SampleConsentSerializer()

    def validate(self, data):
        # Gap 1 cross-field rule: femaleOnly fields required/forbidden based on sex
        sex = data["sex"]
        hormonal = data["hormonal_health"]

        if sex == "Female":
            if hormonal.get("menstrual_cycle") is None or hormonal.get("pregnancy_related") is None:
                raise serializers.ValidationError({
                    "hormonal_health": "menstrual_cycle and pregnancy_related are required when sex is Female."
                })
        else:
            if hormonal.get("menstrual_cycle") is not None or hormonal.get("pregnancy_related") is not None:
                raise serializers.ValidationError({
                    "hormonal_health": "menstrual_cycle and pregnancy_related must be null when sex is Male."
                })
        return data
