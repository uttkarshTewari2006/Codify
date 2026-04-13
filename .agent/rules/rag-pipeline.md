# RAG Pipeline & AI Enhancement Rules

This rule governs the implementation and maintenance of the RAG (Retrieval-Augmented Generation) and LLM fine-tuning features in the Codify project.

## Core Principles
1. **Grounding First**: All AI-generated roadmaps must be grounded in the curated knowledge base unless the retrieval returns zero relevant results.
2. **Quality Determines Success**: Follow the `rag-engineer` skill: "Garbage In, Garbage Out". Curate and clean doc sources (Seed JSON, roadmap.sh) before indexing.
3. **Feedback Loop**: Every "Regeneration" must capture what the user didn't like. This data is the primary source for future fine-tuning.

## Implementation Workflow (Referencing Skills)
1. **Selection**: Use `embedding-strategies` to manage OpenAI `text-embedding-3-small` usage and cost.
2. **Indexing**: Follow `rag-implementation` for chunking. Use semantic boundaries (titles, tasks) rather than fixed token limits.
3. **Retrieval**: Implement hybrid search strategies if pure semantic retrieval misses exact terms (e.g., specific framework versions).
4. **Evaluation**: Regularly audit retrieval quality using `llm-evaluation` metrics (Faithfulness, Answer Relevance).

## Technology Stack
- **Vector Store**: ChromaDB (Local/File-based).
- **Embeddings**: `text-embedding-3-small` (1536d).
- **Orchestration**: LangChain + LangChain-Chroma.

## Admin Controls
- Data sync must be idempotent (re-running `ingest` shouldn't create duplicates).
- The `/admin` dashboard must provide visibility into the "Top-K" chunks retrieved for recent queries to debug hallucinations.
