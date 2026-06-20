from rest_framework import serializers
from ..models import AvailabilitySlot
from django.utils import timezone
from rest_framework.validators import UniqueTogetherValidator


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilitySlot
        fields = ["id", "company", "date", "start_time", "end_time"]
        read_only_fields = ["id", "company"]

    def validate_date(self, value):
        if timezone.localdate() > value:
            raise serializers.ValidationError("The date must be a future date")
        return value

    def validate(self, attrs):
        data = super().validate(attrs)
        date = data.get("date") or (self.instance.date if self.instance else None)
        start_time = data.get("start_time") or (
            self.instance.start_time if self.instance else None
        )
        end_time = data.get("end_time") or (
            self.instance.end_time if self.instance else None
        )

        # 1. Unique slot check
        # Exclude the current instance from the check so it doesn't collide with itself during an update
        duplicate_query = AvailabilitySlot.objects.filter(
            company=self.context["request"].user.company,
            date=date,
            start_time=start_time,
            end_time=end_time,
        )
        if self.instance:
            duplicate_query = duplicate_query.exclude(pk=self.instance.pk)

        if duplicate_query.exists():
            raise serializers.ValidationError({"unique": "this slot already exists"})

        # 2. Time comparison check
        if start_time and end_time and end_time < start_time:
            raise serializers.ValidationError(
                {"time": "The end time must be greater than the start time"}
            )

        return data
