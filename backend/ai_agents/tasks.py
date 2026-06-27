from celery import shared_task

from ai_agents.ocr import extract_text


@shared_task
def run_ocr_on_document(document_id):
    """
    Async OCR for an uploaded document.
    Reads the file, extracts text + confidence, saves back to the Document.
    """
    from orders.models import Document

    try:
        document = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return f"Document {document_id} not found"

    try:
        result = extract_text(document.file.path)
        document.extracted_text = result["text"]
        document.ocr_confidence = result["confidence"]

        # Run verification right after OCR
        from ai_agents.verification import verify_document
        verification = verify_document(document)
        document.needs_review = verification["needs_review"]
        document.verification_flags = verification["flags"]

        document.ocr_status = "done"
        document.save(update_fields=[
            "extracted_text", "ocr_confidence", "ocr_status",
            "needs_review", "verification_flags",
        ])
        return f"OCR done for document {document_id} (conf: {result['confidence']}, review: {verification['needs_review']})"
    except Exception as exc:
        document.ocr_status = "failed"
        document.save(update_fields=["ocr_status"])
        return f"OCR failed for document {document_id}: {exc}"