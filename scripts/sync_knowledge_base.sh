#!/usr/bin/env bash
# ==============================================================================
# KelanaAI - Amazon Bedrock Knowledge Base S3 Sync Script
# Sesi 09: Teaching KelanaAI to Read Knowledge
# ==============================================================================

set -e

S3_BUCKET=${1:-"s3://kelana-travel-docs"}
KB_ID=${2:-"$BEDROCK_KNOWLEDGE_BASE_ID"}
DATA_SOURCE_ID=${3:-"$BEDROCK_DATA_SOURCE_ID"}
DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../knowledge-docs" && pwd)"

echo "========================================================"
echo "🚀 KelanaAI - Knowledge Base Document Sync to S3 & Bedrock"
echo "========================================================"
echo "📁 Local Docs Directory: $DOCS_DIR"
echo "🪣 Target S3 Bucket:    $S3_BUCKET"
echo "🧠 Knowledge Base ID:    ${KB_ID:-'(Not configured - local mode)'}"
echo "========================================================"

# Check if AWS CLI is installed
if command -v aws >/dev/null 2>&1; then
    echo "1️⃣  Syncing local knowledge documents to S3..."
    aws s3 sync "$DOCS_DIR" "$S3_BUCKET" --delete
    echo "✅ S3 sync completed successfully."

    if [ -n "$KB_ID" ] && [ -n "$DATA_SOURCE_ID" ]; then
        echo "2️⃣  Triggering Amazon Bedrock Knowledge Base Ingestion Job..."
        aws bedrock-agent start-ingestion-job \
            --knowledge-base-id "$KB_ID" \
            --data-source-id "$DATA_SOURCE_ID" \
            --description "Sync updated travel documents $(date +%Y-%m-%d_%H:%M:%S)"
        echo "✅ Bedrock ingestion job started."
    else
        echo "ℹ️  KB_ID or DATA_SOURCE_ID not set. Skipping remote ingestion trigger."
    fi
else
    echo "⚠️  AWS CLI not found. Running in local filesystem Knowledge Base mode."
fi

echo "========================================================"
echo "✨ Knowledge Base sync process completed!"
echo "========================================================"
