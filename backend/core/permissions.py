from rest_framework.permissions import BasePermission
from users.models import User


class IsCompany(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.COMPANY_ROLE

    def has_object_permission(self, request, view, obj):
        return request.user == obj.owner


class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == User.CLIENT_ROLE


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser


class isCompanyOwner(IsCompany):
    def has_object_permission(self, request, view, obj):
        return hasattr(request.user, "company") and request.user.company == obj.company
