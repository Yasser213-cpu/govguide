from companies.models import Company
from .recommendation import recommend_companies


def analyze_company(company_id, procedure_id):
    """
    Analyze why a company ranks where it does for a given procedure.
    Returns its rank, score, and how it compares to competitors.
    """
    # 1. Get the ranked companies for this procedure
    ranked = recommend_companies(procedure_id)

    if not ranked:
        return {"error": "لا توجد شركات لهذا الإجراء"}

    # 2. Find our company in the results
    our_service = None
    our_rank = None
    for index, service in enumerate(ranked):
        if service.company.id == company_id:
            our_service = service
            our_rank = index + 1
            break

    if our_service is None:
        return {"error": "الشركة لا تقدم هذا الإجراء أو غير مفعّلة"}

    # 3. Compare against all competitors
    total = len(ranked)
    prices = [float(s.company_service_fee) for s in ranked]
    ratings = [getattr(s, "company_rating", 0.0) or 0.0 for s in ranked]
    days = [s.estimated_completion_days for s in ranked]

    return {
        "rank": our_rank,
        "total": total,
        "score": our_service.score,
        "our_price": float(our_service.company_service_fee),
        "avg_price": round(sum(prices) / len(prices), 2),
        "our_rating": getattr(our_service, "company_rating", 0.0) or 0.0,
        "best_rating": max(ratings),
        "our_days": our_service.estimated_completion_days,
        "fastest_days": min(days),
    }

def build_advice(analysis):
    """Turn the numeric analysis into clear strengths and weaknesses in Arabic."""
    if "error" in analysis:
        return analysis

    strengths = []
    weaknesses = []

    # السعر
    if analysis["our_price"] < analysis["avg_price"]:
        strengths.append(
            f"سعرك ({analysis['our_price']} جنيه) أقل من متوسط المنافسين "
            f"({analysis['avg_price']} جنيه) — نقطة قوة تجذب العملاء."
        )
    else:
        weaknesses.append(
            f"سعرك ({analysis['our_price']} جنيه) أعلى من المتوسط "
            f"({analysis['avg_price']} جنيه) — راجع تسعيرك."
        )

    # التقييم
    if analysis["our_rating"] == 0:
        weaknesses.append(
            "ليس لديك تقييمات بعد — التقييمات ترفع ترتيبك كثيراً، "
            "شجّع عملاءك على تقييم الخدمة بعد إتمامها."
        )
    elif analysis["our_rating"] >= analysis["best_rating"]:
        strengths.append(
            f"تقييمك ({analysis['our_rating']}) هو الأعلى بين المنافسين — حافظ عليه."
        )
    else:
        weaknesses.append(
            f"تقييمك ({analysis['our_rating']}) أقل من الأفضل "
            f"({analysis['best_rating']}) — تحسين جودة الخدمة يرفع ترتيبك."
        )

    # السرعة
    if analysis["our_days"] <= analysis["fastest_days"]:
        strengths.append(
            f"أنت من الأسرع في الإنجاز ({analysis['our_days']} أيام)."
        )
    else:
        weaknesses.append(
            f"مدة إنجازك ({analysis['our_days']} أيام) أبطأ من الأسرع "
            f"({analysis['fastest_days']} أيام) — تسريع الخدمة يحسّن ترتيبك."
        )

    return {
        "rank": analysis["rank"],
        "total": analysis["total"],
        "strengths": strengths,
        "weaknesses": weaknesses,
    }