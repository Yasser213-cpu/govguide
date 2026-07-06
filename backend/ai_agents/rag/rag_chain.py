import os
import chromadb
from openai import OpenAI
from langchain_openai import ChatOpenAI

SOURCE_TO_PROCEDURE_NAME = {
    "جواز_السفر.txt": "تجديد جواز السفر",
    "بطاقة_الرقم_القومي.txt": "إصدار بطاقة الرقم القومي",
    "رخصة_القيادة.txt": "إصدار رخصة قيادة خاصة",
    "شهادة_الميلاد.txt": "استخراج شهادة ميلاد مميكنة",
    "صحيفة_الحالة_الجنائية.txt": "استخراج صحيفة الحالة الجنائية",
}

# ---------- Paths ----------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_store")

# ---------- OpenAI embeddings (must match ingest.py) ----------
EMBED_MODEL = "text-embedding-3-small"

# Questions whose nearest chunk is farther than this are treated as out-of-scope
DISTANCE_THRESHOLD = 1.5

_llm = None
_openai_client = None
_collection = None


def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model="gpt-4o-mini",
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.3,
        )
    return _llm


def get_openai_client():
    global _openai_client
    if _openai_client is None:
        _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


def get_embedding(text):
    """Get an embedding vector from OpenAI (same model as ingest)."""
    response = get_openai_client().embeddings.create(model=EMBED_MODEL, input=text)
    return response.data[0].embedding


def get_collection():
    global _collection
    if _collection is None:
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _collection = client.get_collection(name="gov_procedures")
    return _collection


def retrieve(query, top_k=3):
    """Search Chroma. Returns (context, source) or (None, None) if out of scope."""
    query_embedding = get_embedding(query)
    results = get_collection().query(
        query_embeddings=[query_embedding],
        n_results=top_k,
    )

    nearest_distance = results["distances"][0][0]
    if nearest_distance > DISTANCE_THRESHOLD:
        return None, None

    chunks = results["documents"][0]
    context = "\n\n".join(chunks)
    top_source = results["metadatas"][0][0].get("source")
    return context, top_source


def ask(query):
    context, source = retrieve(query)

    if context is None:
        return {
            "answer": "عذراً، أنا متخصص في الإجراءات الحكومية المصرية فقط "
                      "(مثل جواز السفر، بطاقة الرقم القومي، رخصة القيادة، "
                      "شهادة الميلاد، وصحيفة الحالة الجنائية). لا أملك معلومات عن هذا الموضوع.",
            "tokens": 0,
            "procedure_id": None,
        }

    prompt = f"""أنت مساعد ذكي متخصص في الإجراءات الحكومية المصرية.
أجب على سؤال المستخدم باستخدام المعلومات الموجودة في السياق التالي فقط.
إذا لم تكن الإجابة موجودة في السياق، قل إنك لا تملك هذه المعلومة.
إذا كان السؤال خارج نطاق الإجراءات الحكومية المصرية، لا تحاول الإجابة من معرفتك العامة،
واذكر أنك متخصص في الإجراءات الحكومية المصرية فقط.
أجب باللغة العربية.

السياق:
{context}

السؤال: {query}

الإجابة:"""

    response = get_llm().invoke(prompt)

    tokens = 0
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        tokens = response.usage_metadata.get("total_tokens", 0)

    return {
        "answer": response.content,
        "tokens": tokens,
        "procedure_id": get_procedure_id(source),    }

def get_procedure_id(source):
    """Look up the real procedure id from the DB by name (ids differ per DB)."""
    if not source:
        return None
    name = SOURCE_TO_PROCEDURE_NAME.get(source)
    if not name:
        return None
    from procedures.models import Procedure
    proc = Procedure.objects.filter(name=name).first()
    return proc.id if proc else None
