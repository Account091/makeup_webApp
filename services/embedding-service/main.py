import os
import logging
from typing import List, Literal, Optional
from fastapi import FastAPI, HTTPException, Header, Depends, status
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
import torch

# Logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("embedding-service")

MODEL_NAME = os.getenv("MODEL_NAME", "intfloat/multilingual-e5-small")
SERVICE_SECRET = os.getenv("EMBEDDING_SERVICE_SECRET", "")
EXPECTED_AUDIENCE = os.getenv("CLOUD_RUN_AUDIENCE", "")

# Initialize model
logger.info(f"Loading embedding model: {MODEL_NAME}...")
device = "cuda" if torch.cuda.is_available() else "cpu"
model = SentenceTransformer(MODEL_NAME, device=device)
logger.info(f"Model {MODEL_NAME} loaded successfully on device: {device} (Dimension: 384)")

app = FastAPI(
    title="Makeovers by Prachi — Knowledge Embedding Microservice",
    version="1.0.0",
    description="Dedicated microservice generating 384-dimensional normalized multilingual embeddings with e5 task prefixes.",
)

import secrets

# Authentication Dependency: Requires BOTH Shared Secret (constant-time compare) AND Cloud Run IAM Token
async def verify_auth(
    x_service_secret: Optional[str] = Header(None, alias="x-service-secret"),
    authorization: Optional[str] = Header(None, alias="authorization"),
):
    # 1. Shared Secret Verification (Constant-Time Compare to Prevent Timing Attacks)
    if SERVICE_SECRET:
        if not x_service_secret:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Missing required 'x-service-secret' header.",
            )
        if not secrets.compare_digest(x_service_secret, SERVICE_SECRET):
            logger.warning("Invalid x-service-secret provided.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Invalid service secret.",
            )

    # 2. Google Cloud Run IAM ID Token Verification (Required in production)
    is_prod = os.getenv("NODE_ENV") == "production" or os.getenv("ENVIRONMENT") == "production"
    require_iam = EXPECTED_AUDIENCE or is_prod or os.getenv("REQUIRE_IAM_AUTH", "false").lower() == "true"

    if require_iam:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Missing Google Cloud Run IAM Bearer token.",
            )

        token = authorization.split("Bearer ")[1].strip()
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            request = google_requests.Request()
            claim = id_token.verify_token(token, request, audience=EXPECTED_AUDIENCE or None)
        except Exception as e:
            logger.warning(f"Failed to verify Cloud Run IAM token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Invalid Cloud Run IAM identity token.",
            )

    return {"auth": "dual_verified"}

# Request & Response Schemas
class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=64, description="List of raw text strings to embed.")
    input_type: Literal["query", "passage"] = Field(
        ...,
        description="multilingual-e5 task type: 'query' for customer search questions, 'passage' for knowledge corpus chunks.",
    )

class EmbedResponse(BaseModel):
    vectors: List[List[float]]
    dimension: int
    count: int
    model: str
    input_type: str

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "makeovers-embedding-service",
        "model": MODEL_NAME,
        "dimension": 384,
        "device": device,
    }

@app.post("/embed", response_model=EmbedResponse, dependencies=[Depends(verify_auth)])
def embed_texts(req: EmbedRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="Texts array cannot be empty.")

    # Apply multilingual-e5 specification prefixes
    prefix = "query: " if req.input_type == "query" else "passage: "
    prefixed_texts = [f"{prefix}{t.strip()}" for t in req.texts]

    try:
        # Encode with unit norm normalization (dot product equals cosine similarity)
        embeddings = model.encode(
            prefixed_texts,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True,
        )

        vectors = [vec.tolist() for vec in embeddings]

        return EmbedResponse(
            vectors=vectors,
            dimension=384,
            count=len(vectors),
            model=MODEL_NAME,
            input_type=req.input_type,
        )
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")
