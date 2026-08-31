from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import IntakeSubmissionSerializer
from .models import IntakeSubmission


class IntakeSubmitView(APIView):
    def post(self, request):
        serializer = IntakeSubmissionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        submission = IntakeSubmission.objects.create(
            responses=serializer.validated_data,
            status=IntakeSubmission.STATUS_SUBMITTED,
        )
        return Response(
            { "status": submission.status},
            status=status.HTTP_201_CREATED,
        )
