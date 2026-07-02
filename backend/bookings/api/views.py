# from ..models import AvailabilitySlot
# from .serializers import AvailabilitySlotSerializer
# from rest_framework.response import Response
# from rest_framework import status
# from core.permissions import isCompanyOwner


# class AvailabilitySlotAPIView(CRUDAPIView):
#     model = AvailabilitySlot
#     serializer = AvailabilitySlotSerializer
#     permission_classes = [isCompanyOwner]

#     def post(self, request):
#         serializer = self.serializer(data=request.data, context={"request": request})
#         if serializer.is_valid():
#             serializer.save(company=request.user.company)
#             return Response(serializer.data, status.HTTP_201_CREATED)
#         return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

#     pass
