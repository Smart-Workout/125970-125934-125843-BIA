from __future__ import annotations

import re                                                                  # Tokenize fallback search text and parse Markdown rule fields.
from pathlib import Path                                                    # Refer to project files through settings paths.
from typing import Any                                                      # Type Chroma result dictionaries without over-constraining the API.

from app.core.config import settings                                        # Shared paths and RAG settings are loaded from one config object.
from app.schemas.common import RetrievedSnippet                             # Retrieved snippets use the same response shape across chat and workout.


COLLECTION_NAME = settings.RAG_COLLECTION_NAME                              # Collection name must match build_rag_index.py.


def _fallback_corpus_snippets(query: str, limit: int) -> list[RetrievedSnippet]:
    path = settings.PROJECT_ROOT / "docs" / "rag" / "RAG_CORPUS.md"         # Fallback reads the curated rule corpus directly.
    if not path.exists():
        return []                                                           # Missing corpus means no retrieval context is available.

    query_terms = {term.lower() for term in re.findall(r"[a-zA-Z]{3,}", query)} # Simple keyword set approximates relevance without embeddings.
    chunks = re.split(r"\n###\s+", path.read_text(encoding="utf-8"))        # Each Markdown snippet is treated as one fallback document.
    scored: list[tuple[int, RetrievedSnippet]] = []                         # Score and snippet are stored together for ranking.

    for chunk in chunks[1:]:
        lines = [line.strip() for line in chunk.splitlines() if line.strip()] # Blank lines are removed before metadata extraction.
        if not lines:
            continue
        body = "\n".join(lines[1:])                                        # Body contains category, rule, and usage text.
        category_match = re.search(r"Category:\s*(.+)", body)              # Category helps explain the retrieved rule type.
        rule_match = re.search(r"Rule:\s*(.+)", body)                      # Rule text is the main fallback answer evidence.
        category = category_match.group(1).strip() if category_match else "Rule" # Missing category falls back to Rule.
        text = rule_match.group(1).strip() if rule_match else body[:400]    # Missing rule field falls back to a body preview.
        body_terms = {term.lower() for term in re.findall(r"[a-zA-Z]{3,}", body)} # Body terms are compared with query terms.
        score = len(query_terms & body_terms)                               # Overlap count becomes a lightweight relevance score.
        scored.append((score, RetrievedSnippet(source="RAG_CORPUS.md", category=category, text=text))) # Snippet keeps source/category/text.

    scored.sort(key=lambda item: item[0], reverse=True)                     # Highest overlap appears first.
    return [snippet for score, snippet in scored[:limit] if score > 0] or [snippet for _, snippet in scored[:limit]] # Fallback still returns examples if all scores are zero.


def retrieve_snippets(query: str, limit: int = 5) -> list[RetrievedSnippet]:
    try:
        import chromadb                                                     # Chroma import is lazy so backend startup stays light.
        from sentence_transformers import SentenceTransformer               # Embedding import is lazy because model loading is expensive.
    except ImportError:
        return _fallback_corpus_snippets(query, limit)                      # Missing RAG dependencies should not break the chat endpoint.

    if not settings.CHROMA_DB_DIR.exists():
        return _fallback_corpus_snippets(query, limit)                      # Missing local index falls back to curated corpus keyword search.

    try:
        client = chromadb.PersistentClient(path=str(settings.CHROMA_DB_DIR)) # Open the persistent vector index created by build_rag_index.py.
        collection = client.get_collection(COLLECTION_NAME)                 # Load the Smart Workout knowledge collection.
        model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)          # Query embedding model must match the document embedding model.
        embedding = model.encode([query], normalize_embeddings=True).tolist()[0] # User query becomes a normalized semantic vector.
        results: dict[str, Any] = collection.query(query_embeddings=[embedding], n_results=limit) # Chroma returns nearest documents.
    except Exception:
        return _fallback_corpus_snippets(query, limit)                      # Runtime retrieval errors fall back gracefully.

    snippets: list[RetrievedSnippet] = []                                   # API response snippets are assembled from Chroma results.
    documents = results.get("documents", [[]])[0]                           # Retrieved document text becomes answer evidence.
    metadatas = results.get("metadatas", [[]])[0]                           # Metadata explains source and category.
    for document, metadata in zip(documents, metadatas):
        source = str(metadata.get("source", "chroma_db"))                   # Source identifies ExerciseDB or RAG_CORPUS.
        category = str(metadata.get("category") or metadata.get("doc_type") or "retrieved") # Category falls back to document type.
        snippets.append(
            RetrievedSnippet(
                source=source,                                              # Source is exposed to the chat response.
                category=category,                                          # Category is exposed to the chat response.
                text=str(document)[:900],                                   # Text is trimmed so the API response stays compact.
            )
        )
    return snippets                                                         # Final top-k snippets are returned to the chat service.
