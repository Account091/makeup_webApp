#!/usr/bin/env bash
# ==============================================================================
# Cloud Run Deployment Script for Knowledge Embedding Microservice
# Model: intfloat/multilingual-e5-small (384 Dimensions)
# Region: asia-south1 (Mumbai)
#
# NOTICE: This script is prepared for manual deployment when authorized.
# DO NOT RUN WITHOUT EXPLICIT CONFIRMATION.
# ==============================================================================

set -euo pipefail

SERVICE_NAME="makeovers-embedding-service"
REGION="asia-south1"
PROJECT_ID="${GCP_PROJECT_ID:-makeovers-by-prachi}"
SECRET_VALUE="${EMBEDDING_SERVICE_SECRET:-mbp_embed_secret_prod_$(openssl rand -hex 12)}"

echo "=== Deploying $SERVICE_NAME to Cloud Run ($REGION) ==="
echo "Project: $PROJECT_ID"
echo "Min Instances: 1 (Maintains 1 warm container to reduce cold start frequency)"
echo "Memory: 2Gi, CPU: 1"

gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --min-instances 1 \
  --max-instances 5 \
  --cpu 1 \
  --memory 2Gi \
  --concurrency 80 \
  --timeout 15s \
  --set-env-vars "MODEL_NAME=intfloat/multilingual-e5-small,EMBEDDING_SERVICE_SECRET=$SECRET_VALUE" \
  --no-allow-unauthenticated

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format 'value(status.url)')

echo ""
echo "=== Deployment Complete ==="
echo "Service URL: $SERVICE_URL"
echo "Add these environment variables to customer-web/.env.production:"
echo "EMBEDDING_SERVICE_URL=$SERVICE_URL"
echo "EMBEDDING_SERVICE_SECRET=$SECRET_VALUE"
