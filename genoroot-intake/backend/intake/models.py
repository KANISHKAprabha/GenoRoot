from django.db import models


class IntakeSubmission(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_SUBMITTED = "submitted"

    
    patient_ref = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default=STATUS_DRAFT)
    responses = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"IntakeSubmission({self.id}, {self.status})"
