from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.exceptions import FieldDoesNotExist

# from rest_framework


class CrudAPIView(APIView):
    external_model = None
    model = None
    basic_serializer = None
    read_serializer = None
    paginator = None
    filter = None
    update_serializer = None
    permission_classes = []

    def get_external_object(self, id):
        try:
            object = self.external_model.objects.get(pk=id)
            return object
        except self.external_model.DoesNotExist:
            raise NotFound(
                {
                    "detail": f"there is no  {self.external_model.__name__}     matches this id "
                }
            )

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [perm() for perm in self.permission_classes] + [IsAuthenticated()]

    def get_object(self, id):
        try:
            object = self.model.objects.get(pk=id)
            return object
        except self.model.DoesNotExist:
            raise NotFound(
                {"detail": f"there is no  {self.model.__name__}     matches this id "}
            )

    def get(self, request, id=None):
        serializer = None
        if id:
            object = self.get_object(id)
            if not self.read_serializer:
                serializer = self.basic_serializer(object)
            else:
                serializer = self.read_serializer(object)
            return Response(serializer.data, status.HTTP_200_OK)

        query_set = self.model.objects.all()
        if self.filter:
            filter = self.filter(request.GET, query_set)
            query_set = filter.qs

        if self.paginator:
            paginator = self.paginator()
            query_set = paginator.paginate_queryset(query_set, request)

        if not self.read_serializer:
            data = self.basic_serializer(query_set, many=True).data
        else:
            data = self.read_serializer(query_set, many=True).data

        return Response(data, status.HTTP_200_OK)

    def delete(self, request, id):
        object = self.get_object(id)
        self.check_object_permissions(request, object)
        try:
            object._meta.get_field("is_available")
            object.is_available = False
            object.save(update_fields=["is_available"])
        except FieldDoesNotExist:
            object.delete()

        return Response(status.HTTP_204_NO_CONTENT)

    def perform_update(self, is_Partial, object):

        if not self.update_serializer:
            serializer = self.basic_serializer(
                object,
                data=self.request.data,
                partial=is_Partial,
                context={"request": self.request, "object": object},
            )
        else:
            serializer = self.update_serializer(
                object,
                data=self.request.data,
                partial=is_Partial,
                context={"request": self.request, "object": object},
            )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        object = self.get_object(id)
        return self.perform_update(is_Partial=False, object=object)

    def patch(self, request, id):
        object = self.get_object(id)
        return self.perform_update(is_Partial=True, object=object)
