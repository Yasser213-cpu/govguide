from companies.models import CompanyService
from django.db.models import Avg, Value
from django.db.models.functions import Coalesce



WEIGHTS = {
    "price": 0.30,
    "location": 0.25,
    "speed": 0.20,
    "rating": 0.25,
}


def score_service(service, user_governorate, min_price, max_price, min_days, max_days):
    """Score a single CompanyService (0..1, higher is better)."""
    if max_price == min_price:
        price_score = 1.0
    else:
        price_score = float(max_price - service.company_service_fee) / float(max_price - min_price)

    if max_days == min_days:
        speed_score = 1.0
    else:
        speed_score = float(max_days - service.estimated_completion_days) / float(max_days - min_days)

    if service.company.governorate == user_governorate:
        location_score = 1.0
    else:
        location_score = 0.0
        
    rating = getattr(service, "company_rating", 0.0) or 0.0
    rating_score = float(rating) / 5.0

    total = (
        price_score * WEIGHTS["price"]
        + location_score * WEIGHTS["location"]
        + speed_score * WEIGHTS["speed"]
        + rating_score * WEIGHTS["rating"]
    )
    return total


def recommend_companies(procedure_id, user_governorate=None):
    """
    Return CompanyServices for a procedure, scored and ranked (best first).
    """
    services = list(
        CompanyService.objects.filter(
            procedure_id=procedure_id,
            is_available=True,
            company__is_verified=True,
        )
        .select_related("company")
        .annotate(
            company_rating=Coalesce(
                Avg("company__services__orders__order_review__rating"),
                Value(0.0),
            )
        )
    )

    if not services:
        return []

    prices = [s.company_service_fee for s in services]
    days = [s.estimated_completion_days for s in services]
    min_price, max_price = min(prices), max(prices)
    min_days, max_days = min(days), max(days)

    scored = []
    for s in services:
        score = score_service(s, user_governorate, min_price, max_price, min_days, max_days)
        s.score= round(score,3)
        scored.append(s)
    scored.sort(key=lambda s: s.score, reverse=True)

    return scored