from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status


def get_token(user):
            refresh = RefreshToken.for_user(user)
            refresh["role"] = user.role

            access = refresh.access_token
            access["role"] = user.role

            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(access),
                    "role": user.role,
                },
                status=status.HTTP_201_CREATED,
            )

