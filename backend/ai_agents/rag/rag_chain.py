import os
import chromadb
from sentence_transformers import SentenceTransformer
from langchain_openai import ChatOpenAI

# ---------- Paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")

# ---------- LLM setup (OpenRouter) ----------
llm = ChatOpenAI(
    model="openrouter/free",   
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.3,
)

# ---------- Embedding model + Chroma ----------
print("Loading embedding model...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_collection(name="gov_procedures")

def retrieve(query, top_k=3):
    """Search Chroma and return the most relevant chunks as one text block."""
    # Convert the question into an embedding
    query_embedding = embed_model.encode(query).tolist()

    # Get the top_k most similar chunks
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    # Join all retrieved chunks into a single context string
    chunks = results["documents"][0]
    context = "\n\n".join(chunks)
    return context
def ask(query):
    """Full RAG: retrieve context, then ask the LLM to answer from it."""
    # 1. Retrieve relevant context from Chroma
    context = retrieve(query)

    # 2. Build the prompt for the LLM
    prompt = f"""You are a helpful assistant for Egyptian government procedures.
Answer the user's question using ONLY the context below.
If the answer is not in the context, say you don't have that information.

Context:
{context}

Question: {query}

Answer:"""

    # 3. Send the prompt to the LLM and get the answer
    response = llm.invoke(prompt)
    return response.content


# let's test
if __name__ == "__main__":
    question = "What documents do I need to renew my passport?"
    answer = ask(question)
    print(f"\nQuestion: {question}\n")
    print(f"Answer: {answer}\n")
