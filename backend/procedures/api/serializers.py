from rest_framework import serializers
from ..models import Procedure, Requirement


class RequirementSerializer(serializers.ModelSerializer):
    done = serializers.SerializerMethodField()

    class Meta:
        model = Requirement
        fields = ["id", "title", "description", "done"]

    def get_done(self, obj):
        # placeholder — real completion logic comes in Sprint 4 (after uploads)
        return False


class ProcedureSerializer(serializers.ModelSerializer):
    # Read: full requirement objects (id, title, description, done)
    requirements = RequirementSerializer(many=True, read_only=True)

    # Write: send a plain list of existing requirement ids, e.g. [1, 3, 5]
    requirement_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Requirement.objects.all(),
        source="requirements",
        write_only=True,
        required=False,
    )

    class Meta:
        model = Procedure
        fields = [
            "id",
            "name",
            "description",
            "estimated_government_fee",
            "estimated_processing_days",
            "government_authority",
            "requirements",
            "requirement_ids",
            "is_active",
        ]
        read_only_fields = ["id"]


class ProcedureListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = [
            "id",
            "name",
            "description",
            "estimated_government_fee",
            "estimated_processing_days",
            "government_authority",
        ]
        read_only_fields = ["id"]