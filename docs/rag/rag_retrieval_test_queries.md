# Week 2 RAG Retrieval Test Queries

Use these queries after running `python scripts/build_rag_index.py`.

1. bodyweight chest exercise for low readiness
2. dumbbell back exercise instructions
3. substitute barbell exercise with dumbbell
4. reduce workout volume after poor sleep
5. high stress recovery workout rule
6. leg workout with no machine available
7. exercise for shoulders using cable
8. nutrition macro guidance for workout dashboard
9. how to adjust plan for beginner
10. weekly schedule avoid training same muscle two days

Expected check:

- Top-5 results should include at least one ExerciseDB exercise when the query asks for an exercise.
- Top-5 results should include at least one rule snippet when the query asks about readiness, recovery, scheduling, or substitution.
- Metadata should expose `doc_type`, `source`, and either exercise fields or rule category fields.
