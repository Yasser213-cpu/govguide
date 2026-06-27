import pytesseract
from PIL import Image


def extract_text(image_path, lang="ara+eng"):
    """
    Run OCR on an image file. Returns extracted text + average confidence (0..100).
    `image_path` is a filesystem path (e.g. document.file.path).
    """
    image = Image.open(image_path)

    # Full extracted text
    text = pytesseract.image_to_string(image, lang=lang)

    # Per-word data, used to compute confidence
    data = pytesseract.image_to_data(image, lang=lang, output_type=pytesseract.Output.DICT)

    # tesseract gives a confidence per word; average the valid ones (>= 0)
    confidences = [int(c) for c in data["conf"] if int(c) >= 0]
    avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.0

    return {
        "text": text.strip(),
        "confidence": avg_confidence,
    }