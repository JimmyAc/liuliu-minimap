# RAG Notes

The current implementation uses a lightweight RAG strategy instead of a vector database.

## Why this version

- fastest to ship for MVP
- avoids frontend API key exposure
- gives more grounded tasks than direct prompt-only generation
- still works when Gemini is unavailable

## Retrieval assets

- `cloudfunctions/generateTheme/knowledge.js`
  - scene profiles
  - mission template library
  - preference bias table
- `cloudfunctions/generateTheme/rag.js`
  - keyword retrieval
  - category selection
  - fallback theme builder
  - grounded prompt builder

## Upgrade path

Phase 2 can replace or extend this with:
- POI retrieval from map services
- approved community discoveries as retrieval corpus
- embeddings and vector search
- personalized retrieval based on user history
