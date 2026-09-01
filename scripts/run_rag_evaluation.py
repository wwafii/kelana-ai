"""
KelanaAI - Session 09 RAG Evaluation & Comparison Script
Menjalankan pengujian 5 pertanyaan spesifik dan membandingkan hasil Base Model vs RAG.
"""

import os
import sys
import json

# Setup import path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from services.kb_service import ask_base_model, ask_knowledge_base, compare_rag_vs_base

TEST_QUESTIONS = [
    {
        "id": 1,
        "question": "What is the mandatory entry requirement and timeframe for digital health declaration when traveling to Singapore?",
        "topic": "Singapore Entry & SG Arrival Card (SGAC)",
        "expected_doc": "knowledge-docs/singapore-travel-guide.md",
    },
    {
        "id": 2,
        "question": "What is the exact minimum purchase threshold per receipt for foreign tourists to claim instant tax refunds in South Korea?",
        "topic": "South Korea Tax Refund Policy",
        "expected_doc": "knowledge-docs/south-korea-travel-guide.md",
    },
    {
        "id": 3,
        "question": "What are the rules and certificate requirements (Yakkan Shoumei) for bringing prescription medication into Japan?",
        "topic": "Japan Medication Import & Yakkan Shoumei",
        "expected_doc": "knowledge-docs/japan-travel-insurance-and-customs.md",
    },
    {
        "id": 4,
        "question": "What are the luggage dimension limits and penalty fees for bringing oversized baggage onto Japan's Shinkansen trains without reservation?",
        "topic": "Shinkansen Oversized Baggage Regulations",
        "expected_doc": "knowledge-docs/japan-travel-insurance-and-customs.md",
    },
    {
        "id": 5,
        "question": "What are the validity period, processing time, and official portal fee for Vietnam's tourist e-Visa?",
        "topic": "Vietnam 90-Day e-Visa Regulations",
        "expected_doc": "knowledge-docs/vietnam-travel-guide.md",
    },
]

def main():
    print("=" * 80)
    print("🚀 Running KelanaAI Session 09 RAG Evaluation (5 Test Questions)")
    print("=" * 80)

    results = []

    for item in TEST_QUESTIONS:
        qid = item["id"]
        q = item["question"]
        print(f"\n[{qid}/5] Testing Question: {q}")
        print(f"    Topic: {item['topic']}")

        # 1. Base Model Answer
        base_res = ask_base_model(q)
        print(f"    🤖 Base Model Output generated ({len(base_res['answer'])} chars)")

        # 2. Grounded RAG Answer
        rag_res = ask_knowledge_base(q)
        print(f"    📚 Grounded RAG Output generated ({len(rag_res['answer'])} chars) | Sources: {rag_res['sources']}")

        results.append({
            "id": qid,
            "topic": item["topic"],
            "question": q,
            "expected_doc": item["expected_doc"],
            "base_model": base_res,
            "rag": rag_res,
        })

    # Save to JSON
    output_file = os.path.join(os.path.dirname(__file__), "..", "docs", "evaluation_results_session_09.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 80)
    print(f"✅ Evaluation completed! Saved results to {output_file}")
    print("=" * 80)

if __name__ == "__main__":
    main()
