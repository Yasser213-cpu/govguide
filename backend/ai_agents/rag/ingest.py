import os
from pypdf import PdfReader
import chromadb
from sentence_transformers import SentenceTransformer

# ---------- Paths ----------
# Directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Folder containing the source PDFs
PDF_DIR = os.path.join(BASE_DIR, "sample_pdfs")
# Folder where Chroma will persist its data on disk
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")

# ---------- Embedding model ----------
# Load a free, local embedding model (downloads once on first run)
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# ---------- Chroma setup ----------
# PersistentClient saves data to disk so it survives restarts
client = chromadb.PersistentClient(path=CHROMA_DIR)
# Get the collection if it exists, otherwise create it
collection = client.get_or_create_collection(name="gov_procedures")


def read_pdf(file_path):
    """Read all text from a PDF file and return it as a single string."""
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        # extract_text() may return None for empty pages, so guard with "or ''"
        text += (page.extract_text() or "") + "\n"
    return text


def chunk_text(text, chunk_size=500, overlap=50):
    """
    Split text into overlapping chunks.
    chunk_size = number of words per chunk.
    overlap = number of words shared between consecutive chunks
    (prevents losing information that sits on a chunk boundary).
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        # Move forward, leaving an overlap with the previous chunk
        start += chunk_size - overlap
    return chunks


def ingest():
    """Read every PDF, split it, embed each chunk, and store it in Chroma."""
    doc_id = 0
    for filename in os.listdir(PDF_DIR):
        # Skip anything that is not a PDF
        if not filename.endswith(".pdf"):
            continue

        print(f"Processing: {filename}")
        file_path = os.path.join(PDF_DIR, filename)

        # 1. Read the PDF text
        text = read_pdf(file_path)
        # 2. Split into chunks
        chunks = chunk_text(text)

        # 3. Embed and store each chunk
        for chunk in chunks:
            # Convert the chunk into a numeric vector
            embedding = model.encode(chunk).tolist()
            collection.add(
                ids=[f"doc_{doc_id}"],              # unique id for this chunk
                embeddings=[embedding],             # the numeric vector
                documents=[chunk],                  # the original text
                metadatas=[{"source": filename}],   # which file it came from
            )
            doc_id += 1

    print(f"Done. Total chunks stored: {doc_id}")


if __name__ == "__main__":
    ingest()