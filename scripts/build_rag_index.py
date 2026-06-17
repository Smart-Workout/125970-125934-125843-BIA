from __future__ import annotations

import ast                                                                  # Parse Python-style list strings from cleaned CSV columns.
import json                                                                 # Parse JSON-style list strings and write index manifest metadata.
import re                                                                   # Split Markdown rule snippets and extract metadata fields.
from pathlib import Path                                                    # Build portable paths from the project root.
from typing import Any                                                      # Type flexible CSV values and Chroma metadata dictionaries.

import pandas as pd                                                         # Load the cleaned ExerciseDB catalog produced in Week 1.
from sentence_transformers import SentenceTransformer                       # Convert text documents into semantic embedding vectors.

import chromadb                                                             # Persist searchable vector documents in a local ChromaDB folder.


COLLECTION_NAME = "smart_workout_knowledge"                                 # Shared collection name used by scripts and backend retrieval service.
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"                                    # Small sentence-transformer model balances speed and retrieval quality.


def find_project_root(start: Path | None = None) -> Path:
    current = (start or Path.cwd()).resolve()                                # Search begins wherever the script or notebook was launched.
    for candidate in [current, *current.parents]:
        if (candidate / "data" / "processed" / "exercisedb_cleaned_catalog.csv").exists():
            return candidate                                                 # Project root is identified by the processed ExerciseDB catalog.
    raise FileNotFoundError("Could not find project root with processed ExerciseDB catalog.")


def parse_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]    # Already-parsed lists are cleaned and returned directly.
    if pd.isna(value):
        return []                                                            # Missing metadata becomes an empty list.
    text = str(value).strip()                                                # CSV values are normalized to text before parsing.
    if not text:
        return []                                                            # Blank strings become empty lists.
    for parser in (json.loads, ast.literal_eval):
        try:
            parsed = parser(text)                                            # Try JSON first, then Python literal format.
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()] # Parsed list items become normalized metadata values.
        except Exception:
            continue                                                         # Parser failures fall through to comma splitting.
    return [part.strip() for part in text.split(",") if part.strip()]        # Comma fallback keeps messy list strings usable.


def join_metadata(values: list[str]) -> str:
    return "|".join(sorted({value.strip().lower() for value in values if value.strip()})) # Chroma metadata stores list-like values as a stable string.


def exercise_documents(project_root: Path) -> tuple[list[str], list[str], list[dict[str, Any]]]:
    path = project_root / "data" / "processed" / "exercisedb_cleaned_catalog.csv" # Cleaned exercise catalog is the main retrieval source.
    df = pd.read_csv(path)                                                    # Each ExerciseDB row becomes one retrieval document.

    ids: list[str] = []                                                       # Chroma requires stable IDs for upsert operations.
    documents: list[str] = []                                                 # Document text is what the embedding model reads.
    metadatas: list[dict[str, Any]] = []                                      # Metadata supports filtering and result explanation.

    for _, row in df.iterrows():
        exercise_id = str(row["exercise_id"])                                # Source ID keeps retrieval results traceable to the exercise table.
        body_parts = parse_list(row.get("body_parts"))                       # Body-part metadata helps body-part-aware queries.
        equipment = parse_list(row.get("equipments"))                        # Equipment metadata helps substitution and availability queries.
        target_muscles = parse_list(row.get("target_muscles"))               # Target-muscle metadata improves exercise matching.
        instructions = str(row.get("instruction_text") or row.get("instructions") or "") # Instruction text gives the retriever useful semantic content.
        name = str(row.get("name") or "Unnamed exercise")                    # Exercise name is included in both document text and metadata.

        document = (
            f"Exercise: {name}\n"                                            # Name gives the embedding a clear exercise identity.
            f"Body parts: {', '.join(body_parts)}\n"                         # Body-part text improves semantic search relevance.
            f"Equipment: {', '.join(equipment)}\n"                           # Equipment text supports equipment-specific queries.
            f"Target muscles: {', '.join(target_muscles)}\n"                 # Muscle text supports target-muscle search.
            f"Instructions: {instructions}"                                  # Full instruction set keeps each exercise self-contained.
        )
        ids.append(f"exercise_{exercise_id}")                                # Prefix prevents ID collisions with rule snippets.
        documents.append(document)                                           # One full exercise row becomes one Chroma document.
        metadatas.append(
            {
                "source": "exercisedb_cleaned_catalog.csv",                 # Source file is shown in retrieval test output.
                "doc_type": "exercise",                                     # Document type separates exercises from curated rules.
                "exercise_id": exercise_id,                                  # Source row identifier supports later deep links or lookups.
                "name": name,                                                # Name is displayed in retrieval QA output.
                "body_parts": join_metadata(body_parts),                     # Metadata stores normalized body-part tags.
                "equipment": join_metadata(equipment),                       # Metadata stores normalized equipment tags.
                "target_muscles": join_metadata(target_muscles),             # Metadata stores normalized target-muscle tags.
            }
        )
    return ids, documents, metadatas


def rule_documents(project_root: Path) -> tuple[list[str], list[str], list[dict[str, Any]]]:
    path = project_root / "docs" / "rag" / "RAG_CORPUS.md"                  # Curated rules created during Week 1 feed the RAG knowledge base.
    text = path.read_text(encoding="utf-8")                                  # Markdown corpus is read as plain text.
    chunks = re.split(r"\n###\s+", text)                                     # Each level-3 heading is treated as one curated snippet.

    ids: list[str] = []                                                       # Stable rule IDs allow repeatable upserts.
    documents: list[str] = []                                                 # Rule document text becomes embedding input.
    metadatas: list[dict[str, Any]] = []                                      # Category metadata supports later filtering and explanation.

    for chunk in chunks[1:]:
        lines = [line.strip() for line in chunk.splitlines() if line.strip()] # Blank lines are removed before field extraction.
        if not lines:
            continue
        snippet_id = lines[0].strip()                                        # Markdown heading becomes the rule snippet identifier.
        body = "\n".join(lines[1:])                                           # Remaining lines contain category, rule, and usage fields.
        category_match = re.search(r"Category:\s*(.+)", body)                # Category supports rule-type filtering.
        applies_match = re.search(r"Applies to:\s*(.+)", body)               # Applies-to text clarifies when the rule is relevant.
        rule_match = re.search(r"Rule:\s*(.+)", body)                        # Rule text is the main policy instruction.
        use_match = re.search(r"Use in system:\s*(.+)", body)                # Use-in-system text connects the rule to final product behavior.
        category = category_match.group(1).strip() if category_match else "General" # Missing category falls back to General.
        applies_to = applies_match.group(1).strip() if applies_match else "" # Missing applies-to field stays blank.
        rule = rule_match.group(1).strip() if rule_match else body           # Missing rule field falls back to full snippet body.
        use_in_system = use_match.group(1).strip() if use_match else ""      # Missing usage field stays blank.

        document = (
            f"Rule category: {category}\n"                                   # Category text strengthens category-based retrieval.
            f"Applies to: {applies_to}\n"                                    # Applies-to text helps match user conditions.
            f"Rule: {rule}\n"                                                # Rule text provides the actual recommendation logic.
            f"Use in system: {use_in_system}"                                # Usage text explains how the chat/dashboard should apply the rule.
        )
        ids.append(f"rule_{snippet_id}")                                     # Prefix prevents collision with exercise document IDs.
        documents.append(document)                                           # One curated snippet becomes one Chroma document.
        metadatas.append(
            {
                "source": "RAG_CORPUS.md",                                  # Source file is displayed in retrieval test output.
                "doc_type": "rule",                                         # Document type separates curated rules from exercises.
                "snippet_id": snippet_id,                                    # Snippet ID supports traceability back to the corpus.
                "category": category,                                        # Category helps review retrieval relevance.
                "applies_to": applies_to,                                    # Applies-to condition is stored for future filtering.
            }
        )
    return ids, documents, metadatas


def batched(items: list[Any], size: int = 128):
    for start in range(0, len(items), size):
        yield start, items[start : start + size]                             # Batch processing avoids sending all 1,580 documents at once.


def main() -> None:
    project_root = find_project_root()                                       # Locate the repository before reading data and writing the vector DB.
    chroma_path = project_root / "chroma_db"                                 # Chroma persistent storage path required by the Week 2 TODO.
    chroma_path.mkdir(parents=True, exist_ok=True)                           # Local vector database folder is created when indexing runs.

    exercise_ids, exercise_docs, exercise_meta = exercise_documents(project_root) # Build ExerciseDB documents from the cleaned catalog.
    rule_ids, rule_docs, rule_meta = rule_documents(project_root)             # Build curated-rule documents from Markdown.

    ids = exercise_ids + rule_ids                                             # Combined IDs cover both exercise and rule documents.
    documents = exercise_docs + rule_docs                                     # Combined document list becomes the embedding workload.
    metadatas = exercise_meta + rule_meta                                     # Combined metadata list stays aligned with the document order.

    model = SentenceTransformer(EMBEDDING_MODEL_NAME)                        # Embedding model turns natural language into vectors.
    client = chromadb.PersistentClient(path=str(chroma_path))                # Persistent client saves vectors to disk for later API retrieval.
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,                                                # Collection name must match backend retrieval settings.
        metadata={
            "embedding_model": EMBEDDING_MODEL_NAME,                         # Metadata documents the vector model used for the index.
            "chunk_strategy": "one ExerciseDB row per document; one curated rule snippet per document", # Chunk strategy is stored for audit.
        },
    )

    for start, doc_batch in batched(documents, size=128):
        end = start + len(doc_batch)                                         # End index keeps IDs, documents, and metadata aligned.
        embeddings = model.encode(doc_batch, normalize_embeddings=True).tolist() # Normalized vectors improve cosine-style semantic retrieval.
        collection.upsert(
            ids=ids[start:end],                                              # Stable IDs allow reruns to update existing records.
            documents=doc_batch,                                             # Raw document text is stored for retrieval output.
            metadatas=metadatas[start:end],                                  # Metadata is stored beside each document.
            embeddings=embeddings,                                           # Vector embeddings make semantic search possible.
        )

    manifest = {
        "collection": COLLECTION_NAME,                                       # Collection name proves where documents were stored.
        "embedding_model": EMBEDDING_MODEL_NAME,                             # Embedding model documents reproducibility.
        "chroma_path": str(chroma_path.relative_to(project_root)),           # Relative Chroma path keeps the manifest portable.
        "chunk_strategy": "full ExerciseDB instruction set per exercise; one curated rule snippet per rule", # Human-readable chunking summary.
        "exercise_documents": len(exercise_ids),                             # Count validates ExerciseDB ingestion.
        "rule_documents": len(rule_ids),                                     # Count validates curated rule ingestion.
        "total_documents": len(ids),                                         # Total count validates full RAG corpus size.
    }
    output_path = project_root / "docs" / "rag" / "rag_index_manifest.json"  # Manifest is saved beside RAG documentation.
    output_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8") # JSON manifest supports quick inspection without opening Chroma.
    print(json.dumps(manifest, indent=2))                                    # Terminal output confirms indexing results immediately.


if __name__ == "__main__":
    main()
