import os
import chromadb
from openai import OpenAI

# ---------- Paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Folder containing the source Arabic .txt documents
DOCS_DIR = os.path.join(BASE_DIR, "sample_docs")
# Folder where Chroma will persist its data on disk
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")

# ---------- OpenAI embeddings ----------
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBED_MODEL = "text-embedding-3-small"


def get_embedding(text):
    """Get an embedding vector from OpenAI for a piece of text."""
    response = openai_client.embeddings.create(model=EMBED_MODEL, input=text)
    return response.data[0].embedding


# ---------- Chroma setup ----------
client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(name="gov_procedures")


def read_txt(file_path):
    """Read all text from a .txt file (UTF-8 for Arabic)."""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def chunk_text(text, chunk_size=500, overlap=50):
    """
    Split text into overlapping chunks.
    chunk_size = number of words per chunk.
    overlap = number of words shared between consecutive chunks.
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def ingest():
    """Read every .txt file, split it, embed each chunk, and store it in Chroma."""
    doc_id = 0
    for filename in os.listdir(DOCS_DIR):
        # Skip anything that is not a .txt file
        if not filename.endswith(".txt"):
            continue

        print(f"Processing: {filename}")
        file_path = os.path.join(DOCS_DIR, filename)

        # 1. Read the text
        text = read_txt(file_path)
        # 2. Split into chunks
        chunks = chunk_text(text)

        # 3. Embed and store each chunk
        for chunk in chunks:
            embedding = get_embedding(chunk)
            collection.add(
                ids=[f"doc_{doc_id}"],
                embeddings=[embedding],
                documents=[chunk],
                metadatas=[{"source": filename}],
            )
            doc_id += 1

    print(f"Done. Total chunks stored: {doc_id}")


if __name__ == "__main__":
    ingest()