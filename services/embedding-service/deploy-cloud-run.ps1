# ==============================================================================
# Cloud Run Deployment Script (PowerShell) for Knowledge Embedding Microservice
# Model: intfloat/multilingual-e5-small (384 Dimensions)
# Region: asia-south1 (Mumbai)
#
# NOTICE: This script is prepared for manual deployment when authorized.
# DO NOT RUN WITHOUT EXPLICIT CONFIRMATION.
# ==============================================================================

param (
    [string]$ProjectId = $env:GCP_PROJECT_ID,
    [string]$Region = "asia-south1",
    [string]$Secret = $env:EMBEDDING_SERVICE_SECRET
)

if (-not $ProjectId) {
    $ProjectId = "makeovers-by-prachi"
}

if (-not $Secret) {
    $Secret = "mbp_embed_secret_prod_" + [System.Guid]::NewGuid().ToString("N").Substring(0, 16)
}

$ServiceName = "makeovers-embedding-service"

Write-Host "=== Deploying $ServiceName to Cloud Run ($Region) ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectId"
Write-Host "Min Instances: 1 (Maintains 1 warm container to reduce cold start frequency)"
Write-Host "Memory: 2Gi, CPU: 1"

gcloud run deploy $ServiceName `
  --source . `
  --project $ProjectId `
  --region $Region `
  --platform managed `
  --min-instances 1 `
  --max-instances 5 `
  --cpu 1 `
  --memory 2Gi `
  --concurrency 80 `
  --timeout 15s `
  --set-env-vars "MODEL_NAME=intfloat/multilingual-e5-small,EMBEDDING_SERVICE_SECRET=$Secret" `
  --no-allow-unauthenticated

$ServiceUrl = gcloud run services describe $ServiceName --project $ProjectId --region $Region --format 'value(status.url)'

Write-Host "`n=== Deployment Completed Successfully ===" -ForegroundColor Green
Write-Host "Service URL: $ServiceUrl"
Write-Host "`nConfigure in customer-web/.env.local or production secrets:"
Write-Host "EMBEDDING_SERVICE_URL=$ServiceUrl"
Write-Host "EMBEDDING_SERVICE_SECRET=$Secret"
