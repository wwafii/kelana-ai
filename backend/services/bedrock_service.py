"""
KelanaAI - AI Service Layer (Amazon Bedrock Integration)
Menghubungkan KelanaAI dengan Amazon Bedrock Runtime menggunakan Boto3 Converse API
untuk menghasilkan rekomendasi rencana perjalanan harian (structured daily itinerary) yang kaya dan personal.
"""

import os
from typing import Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

# Load konfigurasi environment variables dari .env
load_dotenv()


def get_bedrock_client():
    """
    Menginisialisasi dan mengembalikan Boto3 client untuk Amazon Bedrock Runtime.
    Membaca region dari environment variable AWS_REGION (default: ap-southeast-2).
    """
    region = os.getenv("AWS_REGION", "ap-southeast-2")

    # Boto3 secara otomatis membaca kredensial dari environment (AWS_BEARER_TOKEN_BEDROCK / AWS CLI / IAM)
    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
    )
    return client


def build_rich_prompt(
    destination: str,
    days: int,
    budget: float,
    category: str,
    daily_budget: float,
) -> str:
    """
    Membangun prompt terstruktur dan kaya (rich prompt) untuk dikirimkan ke Amazon Bedrock.

    Kriteria prompt:
    1. Structured Daily Plan untuk seluruh durasi hari (Day 1 s/d Day N).
    2. Morning activities: Secara spesifik memberikan 2-3 aktivitas pagi per hari.
    3. Afternoon activities: Memasukkan rekomendasi situs budaya (cultural sites) dan pengalaman lokal.
    4. Evening activities: Menyertakan saran tempat makan malam (dinner spots) dan hiburan malam (nightlife).
    5. Menyesuaikan dengan gaya perjalanan (category) dan alokasi anggaran harian (daily budget).

    Args:
        destination (str): Nama destinasi wisata / kota / negara tujuan.
        days (int): Durasi perjalanan dalam hari.
        budget (float): Total anggaran perjalanan (USD).
        category (str): Kategori perjalanan (Backpacker, Standard, Luxury).
        daily_budget (float): Alokasi estimasi anggaran harian (USD/hari).

    Returns:
        str: String prompt terstruktur siap kirim ke model LLM.
    """
    prompt = f"""You are an expert AI travel planner assistant for KelanaAI.
Create a rich, personalized, and structured {days}-day travel itinerary for {destination}.

Trip Details:
- Destination: {destination}
- Duration: {days} days
- Total Budget: ${budget:,.2f} USD
- Daily Budget: ${daily_budget:,.2f} USD/day
- Travel Style: {category}

Mandatory Output Requirements & Structure:
1. Generate a structured day-by-day plan for all {days} day(s).
2. For each day, provide exactly the following sections with bullet points (-):
   - Morning: Provide specifically 2-3 engaging morning activities (e.g., iconic attractions, walking tours, or breakfast spots).
   - Afternoon: Recommend cultural sites, historical landmarks, and authentic local experiences.
   - Evening: Suggest dinner spots (local culinary/dining) and nightlife or evening entertainment.
3. Tailor all recommendations to the "{category}" travel style and the daily budget of ${daily_budget:,.2f} USD.
4. Keep the tone inspiring, helpful, and concise.

Example Format:
Day 1: Exploring {destination}

Morning:
- Visit [Iconic Landmark] early to avoid crowds.
- Take a stroll around [Scenic Street/Area].
- Have breakfast at a traditional local bakery nearby.

Afternoon:
- Experience [Local Cultural Activity/Workshop].
- Explore [Cultural Site/Museum] to learn about local culture and history.

Evening:
- Enjoy dinner at [Authentic Restaurant/Izakaya/Bistro].
- Experience the vibrant local nightlife and city lights around [Entertainment District].

Now, generate the complete {days}-day itinerary for {destination}:"""
    return prompt.strip()


def generate_travel_recommendation(
    destination: str,
    days: int,
    budget: float,
    category: str,
    daily_budget: float,
    model_id: Optional[str] = None,
) -> str:
    """
    Mengirimkan prompt yang telah diperkaya ke Amazon Bedrock via Converse API
    dan mengembalikan respons teks rekomendasi rencana perjalanan.

    Args:
        destination (str): Nama destinasi tujuan.
        days (int): Durasi perjalanan dalam hari.
        budget (float): Total anggaran perjalanan.
        category (str): Kategori perjalanan (Backpacker, Standard, Luxury).
        daily_budget (float): Estimasi anggaran harian.
        model_id (Optional[str]): Identifier model foundation Bedrock (opsional, default dari MODEL_ID .env).

    Returns:
        str: Hasil rekomendasi perjalanan yang dihasilkan oleh AI.
    """
    if not model_id:
        model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    prompt = build_rich_prompt(
        destination=destination,
        days=days,
        budget=budget,
        category=category,
        daily_budget=daily_budget,
    )

    client = get_bedrock_client()

    try:
        # Mengirimkan prompt menggunakan Bedrock Converse API
        response = client.converse(
            modelId=model_id,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "text": prompt,
                        }
                    ],
                }
            ],
        )

        # Mengekstrak teks balasan dari AI
        ai_response = response["output"]["message"]["content"][0]["text"]
        return ai_response
    except (BotoCoreError, ClientError) as e:
        # Mengangkat kembali exception dengan pesan yang informatif untuk Web Layer
        raise RuntimeError(f"Amazon Bedrock invocation failed: {str(e)}") from e
