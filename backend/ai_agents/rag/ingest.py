import os
import chromadb
from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "sample_docs")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
EMBED_MODEL = "text-embedding-3-small"


def get_embedding(text):
    response = openai_client.embeddings.create(model=EMBED_MODEL, input=text)
    return response.data[0].embedding


client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(name="gov_procedures")


def read_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks


def ingest():
    doc_id = 0
    for filename in os.listdir(DOCS_DIR):
        if not filename.endswith(".txt"):
            continue
        print(f"Processing: {filename}")
        text = read_txt(os.path.join(DOCS_DIR, filename))
        for chunk in chunk_text(text):
            collection.add(
                ids=[f"doc_{doc_id}"],
                embeddings=[get_embedding(chunk)],
                documents=[chunk],
                metadatas=[{"source": filename}],
            )
            doc_id += 1
    print(f"Done. Total chunks stored: {doc_id}")


if __name__ == "__main__":
    ingest()