from django.urls import path
from .views import IntakeSubmitView

urlpatterns = [
    path("intake/submit/", IntakeSubmitView.as_view(), name="intake-submit"),
]
