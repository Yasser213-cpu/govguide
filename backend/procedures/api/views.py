from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from core.permissions import IsAdmin

from ..models import Procedure
from .serializers import ProcedureSerializer
from ..filters import ProcedureFilter


class ProceduresAPIView(APIView):

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]

        return [IsAuthenticated(), IsAdmin()]

    def get_object(self, id):
        try:
            procedure = Procedure.objects.get(pk=id)
            return procedure
        except Procedure.DoesNotExist:
            raise NotFound({"detail": "There is no procedure matches this id"})

    def get(self, request, id=None):
        if id:
            procedure = self.get_object(id)
            serializer = ProcedureSerializer(procedure)
            return Response(serializer.data, status=status.HTTP_200_OK)

        procedures = Procedure.objects.all()
        procedure_filter = ProcedureFilter(request.GET, queryset=procedures)
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(procedure_filter.qs, request)

        serializer = ProcedureSerializer(result_page, many=True)
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
