from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from companies.models import Company, CompanyService
from procedures.models import Procedure
from django.test.utils import override_settings

User = get_user_model()


class Command(BaseCommand):
    help = "Seed test companies, owners, and their services"
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def handle(self, *args, **options):
        data = [
            {
                "owner_email": "office1@example.com",
                "owner_username": "office1",
                "name": "مكتب النيل للخدمات",
                "description": "مكتب خدمات حكومية في القاهرة.",
                "phone": "01011112222",
                "governorate": "القاهرة",
                "city": "مدينة نصر",
                "street": "شارع عباس العقاد",
                "services": [
                    {"procedure": "تجديد جواز السفر", "fee": 700, "days": 3},
                    {"procedure": "إصدار بطاقة الرقم القومي", "fee": 200, "days": 5},
                ],
            },
            {
                "owner_email": "office2@example.com",
                "owner_username": "office2",
                "name": "شركة المستقبل",
                "description": "خدمات إنهاء الأوراق الحكومية.",
                "phone": "01033334444",
                "governorate": "الجيزة",
                "city": "الدقي",
                "street": "شارع التحرير",
                "services": [
                    {"procedure": "تجديد جواز السفر", "fee": 600, "days": 5},
                    {"procedure": "إصدار رخصة قيادة خاصة", "fee": 450, "days": 7},
                ],
            },
            {
                "owner_email": "office3@example.com",
                "owner_username": "office3",
                "name": "مكتب الإنجاز",
                "description": "إنجاز سريع لكل الإجراءات.",
                "phone": "01055556666",
                "governorate": "القاهرة",
                "city": "المعادي",
                "street": "شارع 9",
                "services": [
                    {"procedure": "تجديد جواز السفر", "fee": 850, "days": 2},
                    {"procedure": "استخراج صحيفة الحالة الجنائية", "fee": 150, "days": 4},
                ],
            },
        ]

        for item in data:
            owner, _ = User.objects.get_or_create(
                email=item["owner_email"],
                defaults={
                    "username": item["owner_username"],
                    "role": User.COMPANY_ROLE,
                    "is_verified": True,
                },
            )

            company, _ = Company.objects.get_or_create(
                owner=owner,
                defaults={
                    "name": item["name"],
                    "description": item["description"],
                    "phone": item["phone"],
                    "governorate": item["governorate"],
                    "city": item["city"],
                    "street": item["street"],
                    "is_verified": True,
                },
            )

            for s in item["services"]:
                try:
                    procedure = Procedure.objects.get(name=s["procedure"])
                except Procedure.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Procedure not found: {s['procedure']}"))
                    continue

                CompanyService.objects.get_or_create(
                    company=company,
                    procedure=procedure,
                    defaults={
                        "company_service_fee": s["fee"],
                        "estimated_completion_days": s["days"],
                        "is_available": True,
                    },
                )

            self.stdout.write(self.style.SUCCESS(f"Seeded: {company.name}"))

        self.stdout.write(self.style.SUCCESS("Company seeding done."))