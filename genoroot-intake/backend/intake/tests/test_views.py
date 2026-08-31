"""
Integration test: hits the real IntakeSubmitView through DRF's
APIClient, exactly the way the frontend will. Confirms the full
request/response cycle — not just the serializer in isolation — and
that a valid submission actually persists to the database.

Requires pytest-django's db access (@pytest.mark.django_db) since this
one writes to the database, unlike the serializer-only tests above.
"""
import copy
import pytest
from rest_framework.test import APIClient
from intake.models import IntakeSubmission


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
def test_valid_submission_returns_201_and_creates_row(api_client, valid_male_submission):
    response = api_client.post(
        "/api/intake/submit/", data=valid_male_submission, format="json"
    )

    assert response.status_code == 201
    assert IntakeSubmission.objects.count() == 1

    submission = IntakeSubmission.objects.first()
    assert submission.status == "submitted"
    assert submission.responses["sex"] == "Male"
    assert submission.responses["sample_consent"]["consent"] is True


@pytest.mark.django_db
def test_invalid_submission_returns_400_and_creates_no_row(api_client, valid_male_submission):
    """Consent missing/false — should be rejected before touching the DB."""
    data = copy.deepcopy(valid_male_submission)
    data["sample_consent"]["consent"] = False

    response = api_client.post(
        "/api/intake/submit/", data=data, format="json"
    )

    assert response.status_code == 400
    assert IntakeSubmission.objects.count() == 0


@pytest.mark.django_db
def test_response_errors_are_field_scoped(api_client, valid_male_submission):
    """Confirms error responses come back structured per-field (what
    the frontend review screen needs to point at the right field),
    not as one flat error string."""
    data = copy.deepcopy(valid_male_submission)
    data["lifestyle"]["habits"]["smoking"] = True
    data["lifestyle"]["habits"]["smoking_severity"] = None

    response = api_client.post(
        "/api/intake/submit/", data=data, format="json"
    )

    assert response.status_code == 400
    assert "lifestyle" in response.data


@pytest.mark.django_db
def test_male_with_menstrual_cycle_rejected_at_view_level(api_client, valid_male_submission):
    """Re-confirms Gap 1 at the full HTTP level, not just the
    serializer level — proves the rule survives the real request cycle."""
    data = copy.deepcopy(valid_male_submission)
    data["hormonal_health"]["menstrual_cycle"] = "Regular"

    response = api_client.post(
        "/api/intake/submit/", data=data, format="json"
    )

    assert response.status_code == 400
    assert IntakeSubmission.objects.count() == 0