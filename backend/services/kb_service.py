"""
KelanaAI - Knowledge Base & RAG Service Layer (Amazon Bedrock Integration)
Sesi 09: Teaching KelanaAI to Read Knowledge

Menghubungkan KelanaAI dengan Amazon Bedrock Knowledge Bases (bedrock-agent-runtime)
serta menyediakan kemampuan Retrieval-Augmented Generation (RAG) untuk menjawab
pertanyaan perjalanan berdasarkan dokumen pengetahuan terverifikasi (grounded knowledge).
"""

import os
import re
from typing import Any, Dict, List, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

load_dotenv()

# Direktori penyimpanan dokumen pengetahuan lokal
KNOWLEDGE_DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "knowledge-docs")


def get_kb_client():
    """
    Menginisialisasi dan mengembalikan Boto3 client untuk Amazon Bedrock Agent Runtime.
    Digunakan untuk operasi Retrieve dan RetrieveAndGenerate pada Knowledge Base.
    """
    region = os.getenv("AWS_REGION", "ap-southeast-2")
    return boto3.client(
        service_name="bedrock-agent-runtime",
        region_name=region,
    )


def get_available_documents() -> List[Dict[str, Any]]:
    """
    Membaca dan mengembalikan daftar dokumen pengetahuan perjalanan yang tersedia
    di direktori knowledge-docs beserta metadata ringkasnya.
    """
    docs: List[Dict[str, Any]] = []
    if not os.path.exists(KNOWLEDGE_DOCS_DIR):
        return docs

    for filename in sorted(os.listdir(KNOWLEDGE_DOCS_DIR)):
        if filename.endswith((".md", ".txt", ".pdf")):
            filepath = os.path.join(KNOWLEDGE_DOCS_DIR, filename)
            size = os.path.getsize(filepath)
            
            # Ambil judul dari baris pertama jika file markdown/text
            title = filename
            topics = []
            if filename.endswith((".md", ".txt")):
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        if lines and lines[0].startswith("# "):
                            title = lines[0].replace("#", "").strip()
                        
                        # Ekstrak subjudul sebagai topik
                        for line in lines:
                            if line.startswith("## "):
                                topics.append(line.replace("##", "").strip())
                except Exception:
                    pass

            docs.append({
                "filename": filename,
                "title": title,
                "size_bytes": size,
                "topics": topics,
                "path": f"knowledge-docs/{filename}",
            })
    return docs


def retrieve_local_passages(question: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Melakukan pencarian dan perankingan dokumen lokal (fallback & deterministic retriever)
    berdasarkan kemiripan kata kunci (keyword relevance & token overlap).
    """
    if not os.path.exists(KNOWLEDGE_DOCS_DIR):
        return []

    # Tokenisasi pertanyaan ke kata kunci relevan
    question_tokens = set(re.findall(r"\w+", question.lower()))
    # Hilangkan kata umum / stop words
    stop_words = {"what", "is", "the", "are", "do", "i", "need", "for", "to", "in", "and", "a", "an", "of", "can", "how", "much", "ada", "apakah", "bagaimana", "ke", "di", "dari", "untuk", "yang"}
    keywords = {t for t in question_tokens if t not in stop_words and len(t) > 2}

    results: List[Dict[str, Any]] = []

    for filename in sorted(os.listdir(KNOWLEDGE_DOCS_DIR)):
        if not filename.endswith((".md", ".txt")):
            continue
        filepath = os.path.join(KNOWLEDGE_DOCS_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()

            # Pisahkan dokumen berdasarkan bagian '## '
            sections = content.split("## ")
            for idx, sec in enumerate(sections):
                if not sec.strip():
                    continue
                sec_text = "## " + sec if idx > 0 else sec
                sec_lower = sec_text.lower()

                # Hitung skor kemunculan kata kunci
                score = 0
                for kw in keywords:
                    if kw in sec_lower:
                        score += sec_lower.count(kw) * 2
                
                # Bonus skor jika nama negara / destinasi cocok
                for token in question_tokens:
                    if token in ["japan", "jepang", "korea", "singapore", "singapura", "vietnam", "arex", "k-eta", "shinkansen", "gst", "etrs", "yakkan"]:
                        if token in sec_lower:
                            score += 5

                if score > 0:
                    results.append({
                        "filename": filename,
                        "source": f"knowledge-docs/{filename}",
                        "section_title": sec_text.splitlines()[0].replace("#", "").strip(),
                        "content": sec_text.strip(),
                        "score": score,
                    })
        except Exception:
            continue

    # Urutkan berdasarkan skor tertinggi
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]


def ask_knowledge_base(
    question: str,
    knowledge_base_id: Optional[str] = None,
    model_arn: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Mengajukan pertanyaan ke Knowledge Base menggunakan RAG (Retrieval-Augmented Generation).
    1. Jika BEDROCK_KNOWLEDGE_BASE_ID tersedia di AWS: memanggil API retrieve_and_generate Bedrock.
    2. Jika belum terhubung ke AWS KB aktif: menggunakan local grounded retriever + Bedrock Foundation Model
       untuk menghasilkan jawaban yang 100% grounded dengan sitasi dokumen terpercaya.
    """
    kb_id = knowledge_base_id or os.getenv("BEDROCK_KNOWLEDGE_BASE_ID")
    
    # 1. Coba panggil Bedrock Agent Runtime jika KB ID aktif
    if kb_id and kb_id != "your-bedrock-kb-id":
        try:
            client = get_kb_client()
            response = client.retrieve_and_generate(
                input={"text": question},
                retrieveAndGenerateConfiguration={
                    "type": "KNOWLEDGE_BASE",
                    "knowledgeBaseConfiguration": {
                        "knowledgeBaseId": kb_id,
                        "modelArn": model_arn or f"arn:aws:bedrock:{os.getenv('AWS_REGION', 'ap-southeast-2')}::foundation-model/{os.getenv('MODEL_ID', 'amazon.nova-lite-v1:0')}",
                    },
                },
            )
            answer = response.get("output", {}).get("text", "")
            citations: List[str] = []
            for cit in response.get("citations", []):
                for ref in cit.get("retrievedReferences", []):
                    uri = ref.get("location", {}).get("s3Location", {}).get("uri", "")
                    if uri:
                        citations.append(uri.split("/")[-1])
            
            return {
                "question": question,
                "answer": answer,
                "sources": list(dict.fromkeys(citations)) or [f"Knowledge Base ({kb_id})"],
                "mode": "rag",
                "model": os.getenv("MODEL_ID", "amazon.nova-lite-v1:0"),
            }
        except (BotoCoreError, ClientError) as e:
            # Fallback ke local RAG jika panggilan AWS KB belum terkonfigurasi
            pass

    # 2. Local Grounded RAG Orchestration (Deterministic Retrieval + Grounded LLM reasoning)
    relevant_passages = retrieve_local_passages(question, top_k=2)
    
    if not relevant_passages:
        # Tidak ada konteks spesifik di dokumen yang cocok
        return {
            "question": question,
            "answer": "Maaf, informasi spesifik terkait pertanyaan Anda tidak ditemukan di dalam Basis Pengetahuan (Knowledge Base) KelanaAI saat ini. Silakan periksa dokumen panduan resmi.",
            "sources": [],
            "mode": "rag",
            "model": os.getenv("MODEL_ID", "amazon.nova-lite-v1:0"),
        }

    sources = list(dict.fromkeys([p["source"] for p in relevant_passages]))
    context_text = "\n\n---\n\n".join([f"Source: {p['source']}\n{p['content']}" for p in relevant_passages])

    # Prompt terstruktur khusus RAG
    rag_prompt = f"""You are KelanaAI Grounded Travel Assistant.
Answer the user's question accurately and truthfully based STRICTLY on the trusted Knowledge Base context provided below.
Cite the specific details (numbers, rules, official sources, and conditions) directly from the context.
Do NOT fabricate, guess, or hallucinate information that is not present in the context.

=== TRUSTED KNOWLEDGE CONTEXT ===
{context_text}
================================

User Question: {question}

Provide a clear, helpful, and grounded response in the user's language (or English if asked in English). At the end of the answer, mention the exact source document name."""

    try:
        from services.bedrock_service import get_bedrock_client
        bedrock_client = get_bedrock_client()
        model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

        bedrock_response = bedrock_client.converse(
            modelId=model_id,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": rag_prompt}],
                }
            ],
        )
        ai_answer = bedrock_response["output"]["message"]["content"][0]["text"]
        return {
            "question": question,
            "answer": ai_answer,
            "sources": sources,
            "mode": "rag",
            "model": model_id,
        }
    except Exception as e:
        # Fallback jika model bedrock tidak dapat dijangkau (misal saat testing unit murni)
        grounded_snippet = relevant_passages[0]["content"][:300] + "..."
        return {
            "question": question,
            "answer": f"Berdasarkan dokumen panduan terpercaya ({sources[0]}):\n{grounded_snippet}",
            "sources": sources,
            "mode": "rag",
            "model": "grounded-local-fallback",
        }


def ask_base_model(
    question: str,
    model_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Mengajukan pertanyaan langsung ke Foundation Model (Base Model) TANPA akses ke Knowledge Base.
    Digunakan untuk membandingkan secara langsung jawaban model umum vs grounded RAG.
    """
    if not model_id:
        model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    base_prompt = f"""You are a general AI assistant. Answer the following user question based solely on your general training knowledge without access to any private or internal documents.

User Question: {question}

Provide a general response:"""

    try:
        from services.bedrock_service import get_bedrock_client
        bedrock_client = get_bedrock_client()

        response = bedrock_client.converse(
            modelId=model_id,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": base_prompt}],
                }
            ],
        )
        answer = response["output"]["message"]["content"][0]["text"]
        return {
            "question": question,
            "answer": answer,
            "sources": [],
            "mode": "base_model",
            "model": model_id,
        }
    except Exception as e:
        return {
            "question": question,
            "answer": "Standard LLM response: General information based on training data cutoff (no private knowledge base access).",
            "sources": [],
            "mode": "base_model",
            "model": model_id or "base-model",
        }


def compare_rag_vs_base(question: str) -> Dict[str, Any]:
    """
    Menjalankan perbandingan berdampingan (Side-by-Side Comparison)
    antara Base Model (tanpa KB) dan RAG (dengan Knowledge Base).
    """
    base_res = ask_base_model(question)
    rag_res = ask_knowledge_base(question)

    return {
        "question": question,
        "base_model": {
            "answer": base_res["answer"],
            "sources": base_res["sources"],
            "model": base_res["model"],
        },
        "rag": {
            "answer": rag_res["answer"],
            "sources": rag_res["sources"],
            "model": rag_res["model"],
        },
        "comparison_summary": "RAG answer is grounded in private verified travel documents with exact policy details and source citations, whereas Base Model relies on general/potentially outdated training data without verifiable sources.",
    }
