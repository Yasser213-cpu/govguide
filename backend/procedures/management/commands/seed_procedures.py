from django.core.management.base import BaseCommand

from procedures.models import Procedure, Requirement


class Command(BaseCommand):
    help = "Seed government procedures and their requirements"

    def handle(self, *args, **options):
        data = [
            {
                "name": "تجديد جواز السفر",
                "description": "تجديد جواز السفر المصري للمواطنين.",
                "estimated_government_fee": 500,
                "estimated_processing_days": 5,
                "government_authority": "مصلحة الجوازات والهجرة والجنسية",
                "requirements": [
                    "صورة بطاقة الرقم القومي",
                    "صورتان شخصيتان حديثتان",
                    "الجواز القديم",
                    "إيصال سداد الرسوم",
                ],
            },
            {
                "name": "إصدار بطاقة الرقم القومي",
                "description": "إصدار أو تجديد بطاقة الرقم القومي.",
                "estimated_government_fee": 100,
                "estimated_processing_days": 15,
                "government_authority": "مصلحة الأحوال المدنية",
                "requirements": [
                    "شهادة الميلاد المميكنة",
                    "صورتان شخصيتان",
                    "إثبات محل الإقامة",
                    "إيصال سداد الرسوم",
                ],
            },
            {
                "name": "إصدار رخصة قيادة خاصة",
                "description": "إصدار رخصة قيادة خاصة جديدة.",
                "estimated_government_fee": 300,
                "estimated_processing_days": 7,
                "government_authority": "إدارة المرور",
                "requirements": [
                    "بطاقة الرقم القومي",
                    "كشف طبي (نظر)",
                    "صورتان شخصيتان",
                    "اجتياز اختبار القيادة",
                ],
            },
            {
                "name": "استخراج شهادة ميلاد مميكنة",
                "description": "استخراج شهادة ميلاد مميكنة.",
                "estimated_government_fee": 60,
                "estimated_processing_days": 2,
                "government_authority": "مصلحة الأحوال المدنية",
                "requirements": [
                    "بطاقة الرقم القومي لمقدم الطلب",
                    "بيانات المولود كاملة",
                    "إيصال سداد الرسوم",
                ],
            },
            {
                "name": "استخراج صحيفة الحالة الجنائية",
                "description": "استخراج صحيفة الحالة الجنائية (الفيش والتشبيه).",
                "estimated_government_fee": 30,
                "estimated_processing_days": 3,
                "government_authority": "وزارة الداخلية",
                "requirements": [
                    "بطاقة الرقم القومي",
                    "صورتان شخصيتان",
                    "إيصال سداد الرسوم",
                ],
            },
        ]

        for item in data:
            requirements = item.pop("requirements")
            name = item.pop("name")
            procedure, created = Procedure.objects.get_or_create(
                name=name,
                defaults={**item, "is_active": True},
            )
            for title in requirements:
                req, _ = Requirement.objects.get_or_create(title=title)
                procedure.requirements.add(req)

            status = "Created" if created else "Exists"
            self.stdout.write(
                self.style.SUCCESS(f"{status} -> {procedure.name} ({len(requirements)} reqs)")
            )

        self.stdout.write(self.style.SUCCESS("Seeding done."))