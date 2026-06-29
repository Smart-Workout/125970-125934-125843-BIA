from __future__ import annotations

import json                                                                 # Keep JSON available for future structured retrieval QA extensions.
from pathlib import Path                                                    # Locate the repository and write Markdown test results.

from sentence_transformers import SentenceTransformer                       # Reuse the same embedding model used during indexing.

import chromadb                                                             # Open the persistent ChromaDB index created by build_rag_index.py.


COLLECTION_NAME = "smart_workout_knowledge"                                 # Must match the collection created in build_rag_index.py.
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"                                    # Must match the model used to create stored document embeddings.


SAMPLE_QUERIES = [
    "bodyweight chest exercise for low readiness",                           # Tests exercise retrieval plus readiness context.
    "dumbbell back exercise instructions",                                   # Tests equipment and body-part retrieval.
    "substitute barbell exercise with dumbbell",                             # Tests equipment-substitution rules.
    "reduce workout volume after poor sleep",                                # Tests recovery/readiness rules.
    "high stress recovery workout rule",                                     # Tests stress-aware rule retrieval.
    "leg workout with no machine available",                                 # Tests no-equipment exercise matching.
    "exercise for shoulders using cable",                                    # Tests target body part plus equipment search.
    "nutrition macro guidance for workout dashboard",                        # Tests nutrition-context rule retrieval.
    "how to adjust plan for beginner",                                       # Tests experience-level rule retrieval.
    "weekly schedule avoid training same muscle two days",                   # Tests schedule/split rule retrieval.
]


def find_project_root(start: Path | None = None) -> Path:
    current = (start or Path.cwd()).resolve()                                # Search begins from the terminal or notebook working directory.
    for candidate in [current, *current.parents]:
        if (candidate / "chroma_db").exists() and (candidate / "docs" / "rag").exists():
            return candidate                                                 # Project root must contain both the vector DB and RAG docs.
    raise FileNotFoundError("Could not find project root with chroma_db and docs/rag.")


def main() -> None:
    project_root = find_project_root()                                       # Locate the same project folder used during indexing.
    client = chromadb.PersistentClient(path=str(project_root / "chroma_db")) # Open the local persistent vector database.
    collection = client.get_collection(COLLECTION_NAME)                      # Load the Smart Workout knowledge collection.
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)                        # Query embeddings must use the same model as document embeddings.

    report_lines = [
        "# Week 2 RAG Retrieval Test Results",                              # Markdown title explains the purpose of the output file.
        "",
        "Top-5 retrieval results for 10 sample queries.",                    # Summary line documents the evaluation scope.
        "",
    ]

    for query in SAMPLE_QUERIES:
        embedding = model.encode([query], normalize_embeddings=True).tolist()[0] # Query text becomes a semantic vector.
        results = collection.query(query_embeddings=[embedding], n_results=5) # Chroma returns the five nearest documents.
        report_lines.append(f"## Query: {query}")                            # Each query gets its own section in the QA report.
        report_lines.append("")
        for rank, (doc, metadata, distance) in enumerate(
            zip(results["documents"][0], results["metadatas"][0], results["distances"][0]),
            start=1,
        ):
            report_lines.append(f"{rank}. `{metadata.get('doc_type')}` from `{metadata.get('source')}`") # Rank and source show retrieval traceability.
            if metadata.get("name"):
                report_lines.append(f"   - name: {metadata.get('name')}")    # Exercise results display the exercise name.
            if metadata.get("category"):
                report_lines.append(f"   - category: {metadata.get('category')}") # Rule results display the curated category.
            report_lines.append(f"   - distance: {distance:.4f}")            # Lower distance usually means stronger semantic similarity.
            report_lines.append(f"   - text: {doc[:260].replace(chr(10), ' ')}") # Short preview supports quick relevance review.
        report_lines.append("")

    output_path = project_root / "docs" / "rag" / "rag_retrieval_test_results.md" # Retrieval QA output is stored with RAG documentation.
    output_path.write_text("\n".join(report_lines), encoding="utf-8")       # Markdown file becomes a reviewable evidence artifact.
    print(output_path)                                                       # Terminal output gives the saved file location.


if __name__ == "__main__":
    main()
