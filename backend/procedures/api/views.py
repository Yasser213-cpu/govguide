from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.permissions import IsAdmin

from ..models import Procedure, Requirement
from .serializers import ProcedureSerializer,ProcedureListSerializer, RequirementSerializer
from ..filters import ProcedureFilter

class ProceduresAPIView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAuthenticated()]

    def get_object(self, id):
        try:
            procedure = Procedure.objects.get(pk=id)
            return procedure
        except Procedure.DoesNotExist:
            raise NotFound({"detail": "There is no procedure matches this id"})

    def get(self, request, id=None):
        if id:
            procedure = self.get_object(id)
            if not procedure.is_active:
                raise NotFound({"detail": "There is no procedure matches this id"})
            serializer = ProcedureSerializer(procedure)
            return Response(serializer.data, status=status.HTTP_200_OK)

        procedures = Procedure.objects.filter(is_active=True)
        procedure_filter = ProcedureFilter(request.GET, queryset=procedures)
        serializer = ProcedureListSerializer(procedure_filter.qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):

        serializer = ProcedureSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        procedure = self.get_object(id)
        procedure.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, id):
        procedure = self.get_object(id)

        serializer = ProcedureSerializer(procedure, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        procedure = self.get_object(id)
        serializer = ProcedureSerializer(procedure, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RequirementsAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAuthenticated()]

    def get_object(self, id):
        try:
            return Requirement.objects.get(pk=id)
        except Requirement.DoesNotExist:
            raise NotFound({"detail": "There is no requirement matches this id"})

    def get(self, request, id=None):
        if id:
            requirement = self.get_object(id)
            serializer = RequirementSerializer(requirement)
            return Response(serializer.data, status=status.HTTP_200_OK)

        requirements = Requirement.objects.all()
        serializer = RequirementSerializer(requirements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = RequirementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        requirement = self.get_object(id)
        requirement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, id):
        requirement = self.get_object(id)

        serializer = RequirementSerializer(
            requirement, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        requirement = self.get_object(id)

        serializer = RequirementSerializer(
            requirement, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)