LOW_CONFIDENCE_THRESHOLD = 40
MIN_TEXT_LENGTH = 15

# Each type: distinctive keywords (positive) and keywords that rule it out (negative)
DOCUMENT_TYPES = {
    "بطاقة": {
        "positive": ["بطاقة", "البطاقة"],
        "negative": ["جواز", "passport", "رخصة", "شهادة ميلاد"],
    },
    "جواز": {
        "positive": ["جواز", "passport"],
        "negative": ["رخصة", "شهادة ميلاد"],
    },
    "رخصة": {
        "positive": ["رخصة", "قيادة"],
        "negative": ["جواز", "passport", "بطاقة"],
    },
    "ميلاد": {
        "positive": ["ميلاد", "مواليد"],
        "negative": ["جواز", "رخصة"],
    },
}


def verify_document(document):
    """
    Produce an 'assist' signal for a document based on its OCR result.
    Does NOT accept/reject — only flags things for the human reviewer.
    """
    flags = []

    # 1) Low OCR confidence
    if document.ocr_confidence is not None and document.ocr_confidence < LOW_CONFIDENCE_THRESHOLD:
        flags.append("low_confidence")

    # 2) Almost no text extracted
    if len(document.extracted_text.strip()) < MIN_TEXT_LENGTH:
        flags.append("little_text")

    # 3) Type match against the expected requirement
    type_match = None
    if document.requirement:
        expected = document.requirement.title
        type_match = _matches_expected_type(document.extracted_text, expected)
        if not type_match:
            flags.append("type_uncertain")

    return {
        "flags": flags,
        "type_match": type_match,        # True / False / None
        "needs_review": len(flags) > 0,
    }


def _matches_expected_type(extracted_text, expected_title):
    """
    True  = type matches as expected
    False = a strong negative keyword rules out this type (likely another type)
    None  = uncertain (not enough signal)
    """
    text = extracted_text

    # Find a known type whose key appears in the requirement title
    matched_type = None
    for type_key in DOCUMENT_TYPES:
        if type_key in expected_title:
            matched_type = type_key
            break

    if not matched_type:
        return None  # type not in our map, don't judge

    rules = DOCUMENT_TYPES[matched_type]

    # 1) Negative keyword present -> another type, definitely not a match
    if any(neg in text for neg in rules["negative"]):
        return False

    # 2) Positive keyword present -> match
    if any(pos in text for pos in rules["positive"]):
        return True

    # 3) Neither -> uncertain
    return None