import os
import chromadb
from sentence_transformers import SentenceTransformer

BASE_DIR=os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR=os.path.join(BASE_DIR,"chroma_store")

# ---------- Load model and Chroma ----------
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_collection(name="gov_procedures")

def search(query,top_k=2):
    query_embedding=model.encode(query).tolist()
    results=collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )
    print(f"\nQuery: {query}\n")
    for i, doc in enumerate(results["documents"][0]):
        source = results["metadatas"][0][i]["source"]
        print(f"--- Result {i + 1} (from {source}) ---")
        print(doc[:300])
        print()
if __name__ == "__main__":
    search("What documents do I need to renew my passport?")