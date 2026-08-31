"""
Enums and option lists sourced from references/schema.json at repo root.
Import from here instead of hand-typing choices anywhere in the backend.
"""
import json
from pathlib import Path

# parents: intake/ -> backend/ -> genoroot-intake/ -> Haiku Studio/
_SCHEMA_FILE = Path(__file__).resolve().parents[3] / "references" / "schema.json"

with _SCHEMA_FILE.open(encoding="utf-8") as _f:
    _schema = json.load(_f)


def _options(section_id, question_key):
    for section in _schema["sections"]:
        if section["id"] == section_id:
            for q in section["questions"]:
                if q["key"] == question_key:
                    return q.get("options", [])
    raise KeyError(f"No options found for {section_id}.{question_key}")


def _row_options(section_id, question_key, col_key):
    for section in _schema["sections"]:
        if section["id"] == section_id:
            for q in section["questions"]:
                if q["key"] == question_key:
                    for col in q.get("columns", []):
                        if col["key"] == col_key:
                            return col.get("options", [])
    raise KeyError(f"No options found for {section_id}.{question_key}.{col_key}")


# meta
SEX_OPTIONS = _options("meta", "sex")

# Section A
DURATION_OPTIONS = _options("A", "duration")
FAMILY_HISTORY_OPTIONS = _options("A", "family_history")
PATTERN_OPTIONS = _options("A", "pattern")

# Section B
DIAGNOSED_CONDITIONS_OPTIONS = _options("B", "diagnosed_conditions")
MENSTRUAL_CYCLE_OPTIONS = _options("B", "menstrual_cycle")
PREGNANCY_RELATED_OPTIONS = _options("B", "pregnancy_related")

# Section C
PAST_6_MONTHS_OPTIONS = _options("C", "past_6_months")

# Section D — habits sub-options
def _habit_followup_options(row_key):
    for section in _schema["sections"]:
        if section["id"] == "C":
            for q in section["questions"]:
                if q["key"] == "habits":
                    for row in q["rows"]:
                        if row["key"] == row_key:
                            return row.get("followup", {}).get("options", [])
    return []

SMOKING_SEVERITY_OPTIONS = _habit_followup_options("smoking")
HAIR_WASH_FREQUENCY_OPTIONS = [
    r["options"] for section in _schema["sections"] if section["id"] == "C"
    for q in section["questions"] if q["key"] == "habits"
    for r in q["rows"] if r["key"] == "hair_wash_frequency"
][0]

# Section D — products / procedures
PRODUCT_DURATION_OPTIONS = _row_options("D", "products", "duration")
PROCEDURE_SESSIONS_OPTIONS = _row_options("D", "procedures", "sessions")

PRODUCT_KEYS = [
    r for section in _schema["sections"] if section["id"] == "D"
    for q in section["questions"] if q["key"] == "products"
    for r in q["rows"]
]

PROCEDURE_KEYS = [
    r["key"] for section in _schema["sections"] if section["id"] == "D"
    for q in section["questions"] if q["key"] == "procedures"
    for r in q["rows"]
]

# Section E
SAMPLE_TYPE_OPTIONS = _options("E", "sample_type")
