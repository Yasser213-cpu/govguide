import os
import chromadb
from sentence_transformers import SentenceTransformer
from langchain_openai import ChatOpenAI

# ---------- Paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")

# ---------- Lazy singletons (created only on first use, not at import) ----------
_llm = None
_embed_model = None
_collection = None


def get_llm():
    """Create the LLM client once, on first use."""
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model="openrouter/free",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.3,
        )
    return _llm


def get_embed_model():
    """Load the embedding model once, on first use."""
    global _embed_model
    if _embed_model is None:
        print("Loading embedding model...")
        _embed_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embed_model


def get_collection():
    """Connect to the Chroma collection once, on first use."""
    global _collection
    if _collection is None:
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _collection = client.get_collection(name="gov_procedures")
    return _collection


def retrieve(query, top_k=3):
    """Search Chroma and return the most relevant chunks as one text block."""
    query_embedding = get_embed_model().encode(query).tolist()

    results = get_collection().query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    chunks = results["documents"][0]
    context = "\n\n".join(chunks)
    return context


def ask(query):
    """Full RAG: retrieve context, then ask the LLM to answer from it."""
    context = retrieve(query)

    prompt = f"""You are a helpful assistant for Egyptian government procedures.
Answer the user's question using ONLY the context below.
If the answer is not in the context, say you don't have that information.

Context:
{context}

Question: {query}

Answer:"""

    response = get_llm().invoke(prompt)

    tokens = 0
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        tokens = response.usage_metadata.get("total_tokens", 0)

    return {"answer": response.content, "tokens": tokens}


# let's test
if __name__ == "__main__":
    question = "What documents do I need to renew my passport?"
    answer = ask(question)
    print(f"\nQuestion: {question}\n")
    print(f"Answer: {answer}\n")