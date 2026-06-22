from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
import secrets
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated


def generate_otp():
    return f"{secrets.randbelow(1_000_000):06d}"


def send_verification_email(user, otp):

    subject = "Email Verification"
    message = f"""
                                Hi {user.username}, here is your verification OTP {otp.otp_code} ,it expires in 5 minute
                                """
    receiver = [user.email]

    send_mail(
        subject,
        message,
        None,
        receiver,
        fail_silently=False,
    )


def send_reset_password_otp(user, otp):
    subject = "Reset Password"

    message = f"""
                                Hi {user.username}, here is your reset password OTP {otp.otp_code} , it expires in 5 minute
                                
                                """
    receiver = [user.email]

    send_mail(
        subject,
        message,
        None,
        receiver,
        fail_silently=False,
    )


class CRUDAPIView(APIView):
    model = None
    serializer = None
    filter = None
    paginator = None
    permission_classes = []

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAuthenticated()] + [
            permission() for permission in self.permission_classes
        ]

    def get_object(self, id):
        try:
            data = self.model.objects.get(pk=id)
            return data

        except self.model.DoesNotExist:
            raise NotFound(
                {"detail": f"there is no  {self.model.__name__}     matches this id "}
            )

    def get(self, request, id=None):
        if id:
            object = self.get_object(id)
            data = self.serializer(object).data
            return Response(data, status.HTTP_200_OK)

        queryset = self.model.objects.all()

        if self.filter:
            filter = self.filter(request.GET, queryset)
            queryset = filter.qs

        if self.paginator:
            paginator = self.paginator()
            queryset = paginator.paginate_queryset(queryset, request)

        data = self.serializer(queryset, many=True).data

        return Response(data, status.HTTP_200_OK)

    def delete(self, request, id):
        object = self.get_object(id)
        self.check_object_permissions(request, object)
        object.delete()
        return Response(status.HTTP_204_NO_CONTENT)

    def preform_update(self, request, id, isPartial=False):
        object = self.get_object(id)
        self.check_object_permissions(request, object)

        serializer = self.serializer(
            object, data=request.data, partial=isPartial, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_200_OK)
        return Response(serializer.errors, status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id):
        return self.preform_update(request, id, True)

    def put(self, request, id):
        return self.preform_update(request, id, False)
