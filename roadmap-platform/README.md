# Codify Roadmap Platform

Codify creates and manages personalized learning roadmaps for software engineering roles. It combines a Next.js web application, a FastAPI JSON API, PostgreSQL persistence, and document based retrieval augmented generation (RAG) to ground generated tasks in a curated set of learning resources.

## Architecture

```text
Browser
  │ Next.js pages, React UI, NextAuth session
  ▼
Next.js app (frontend/codify)
  ├── Prisma ───────────────────────► PostgreSQL (users/auth data)
  └── /api/backend proxy ──────────► FastAPI (backend)
                                         ├── SQLModel ─► PostgreSQL (roadmaps/tasks/deadlines)
                                         ├── OpenAI chat model (roadmap JSON)
                                         └── KnowledgeBase ─► PostgreSQL pgvector
                                                                  ▲
                                      OpenAI embeddings ◄─────────┘
                                      Markdown knowledge documents
```

The frontend owns the user experience, OAuth and credential sign-in, and its Prisma access to user records. Browser API calls use the same-origin Next.js catch-all proxy at `/api/backend/[...path]`. That proxy forwards requests to the private FastAPI service and signs a short-lived backend token from the authenticated NextAuth identity. FastAPI validates the signed bearer token, checks resource ownership, and reads/writes application records using SQLModel. Both services are configured to use the same PostgreSQL database URL; Prisma and SQLModel represent the corresponding user and roadmap domain tables.

The backend is organized as a small modular monolith: `main.py` defines HTTP routes and coordinates auth, generation, and persistence; `generator.py` builds LLM prompts and validates generated links; `knowledge_base.py` indexes and retrieves source documents; `database.py` defines relational models and sessions; `auth.py` validates service tokens. This keeps deployment and local operation straightforward, while keeping the main responsibilities in separate modules.

## Tech stack

| Area | Technology | Role |
| --- | --- | --- |
| Web | Next.js 16, React 19, TypeScript | App Router UI, server routes, and backend proxy |
| UI | Tailwind CSS 4, Radix UI, lucide-react, dnd-kit | Styling, accessible controls, icons, and sortable roadmap tasks |
| Frontend auth | NextAuth 4, `jose`, bcryptjs | Google and LinkedIn OAuth, email/password credentials, JWT session |
| Frontend data access | Prisma 5 | User/auth database operations and migrations |
| API | Python, FastAPI, Uvicorn | JSON endpoints and request orchestration |
| Backend persistence | SQLModel, SQLAlchemy, psycopg 3 | Typed relational models and PostgreSQL connections |
| LLM orchestration | LangChain, `langchain-openai` | Chat model, prompt template, JSON output parsing, embeddings |
| Chat generation | OpenAI chat model; `CODIFY_MODEL` defaults to `gpt-4o-mini` | Structured roadmap task generation and regeneration |
| Embeddings | OpenAI `text-embedding-3-small` | Embed source chunks and search queries |
| Vector store | PostgreSQL with pgvector via LangChain's PGVector integration | Persistent vector collection `roadmap_knowledge` in the shared PostgreSQL service |
| Main database | PostgreSQL | Users, roadmaps, tasks, deadlines, feedback logs |
| Configuration | dotenv / environment variables | Secrets and service/database configuration |

The frontend package also includes Vitest, Testing Library, Playwright, and ESLint tooling. The repository includes backend pytest tests and RAG quality/seed scripts.

## RAG design: document RAG

The knowledge base is **document RAG**: it retrieves relevant passages from a fixed corpus of Markdown reference documents and supplies those passages to the language model as context. It is not graph RAG (there is no entity/relationship graph traversal), database RAG (there is no retrieval over user or product tables), nor live web search. The indexed material lives in `backend/seed_data/knowledge/`; source URLs are listed in the accompanying `metadata.json` and carried along as document metadata.

### Indexing and chunking

`KnowledgeBase.ingest_knowledge_docs()` reads each `.md` file and uses LangChain's `RecursiveCharacterTextSplitter` with:

- `chunk_size=1000` characters
- `chunk_overlap=100` characters
- separators `\n## `, `\n### `, newline, space, then individual characters

This favors splitting at Markdown headings and paragraph/line boundaries before splitting within words or characters. The 100-character overlap preserves a small amount of neighboring context at chunk boundaries. Each pgvector record carries `source`, `type="knowledge_doc"`, a per-source `chunk` index, and the source `urls`. Ingestion replaces the existing collection by default (`replace_existing=True`) to avoid retaining stale copies of the corpus. Run `python knowledge_base.py` from `backend/` to rebuild the collection and print its count; vectors are persisted in PostgreSQL alongside the application data.

### Query and generation path

1. On roadmap creation, the retrieval query joins the user's `targetRole`, `experienceLevel`, and `goals` fields. On regeneration, the user's feedback is the retrieval query.
2. `KnowledgeBase.query(query_text, top_k=...)` calls `self.vector_store.similarity_search(query_text, k=top_k)`. LangChain's PGVector integration embeds that query using the same configured embedding object and performs vector similarity retrieval against PostgreSQL.
3. `OpenAIEmbeddings(model="text-embedding-3-small")` is the embedding implementation. LangChain calls its embedding API as needed for indexing and query embedding; the application does not manually call an embeddings endpoint or name a separate fetch function. The vector store is initialized with `embedding_function=self.embeddings`.
4. Creation retrieves up to 5 chunks; regeneration retrieves up to 3. `format_retrieved_context()` supplies chunk text, source filename, and source URLs to the prompt.
5. `generator.py` builds a LangChain chain (`ChatPromptTemplate | ChatOpenAI | JsonOutputParser`) and invokes it with the user data (and for regeneration, the current roadmap and feedback). The model is selected with `CODIFY_MODEL`; default is `gpt-4o-mini`, temperature `0.7`.
6. Generated task links are filtered by `sanitize_task_links()`. For creation, only URLs found in retrieved source metadata/content are allowed. For regeneration, URLs already present in the existing roadmap are also allowed. This reduces invented links; it does not verify that a URL is reachable or that its contents remain accurate.
7. FastAPI persists the resulting roadmap/task records in PostgreSQL. If the knowledge base cannot initialize, generation and regeneration return HTTP 503 rather than silently generating without retrieval.

The corpus currently contains seven authored Markdown documents covering backend, frontend, DevOps/platform engineering, full-stack integration, system design, software architecture, and AI/RAG systems. The documents are curated inputs, not automatically refreshed web content.

## Why these tradeoffs

| Choice | Alternatives considered | Reason and tradeoff |
| --- | --- | --- |
| Next.js plus a separate FastAPI service | One Python-rendered app/API; a single Next.js API for everything | Next.js fits the interactive TypeScript app and auth integrations; FastAPI/Python fits the LangChain and RAG ecosystem. The split adds a service boundary, deployment configuration, and two runtimes. |
| PostgreSQL with Prisma on the frontend and SQLModel on the backend | One ORM/service owning all database access; document database | PostgreSQL suits related users, roadmaps, tasks, deadlines, and ownership queries. Each runtime uses its native ORM, which avoids forcing one language boundary but requires model/schema consistency and shared migrations discipline. JSON columns retain flexible deliverables/links while core entities remain relational. |
| Document RAG over curated Markdown | Prompt-only generation; live web search; graph RAG; retrieval from application data | A small controlled corpus is reproducible, inexpensive to query, and provides traceable resource URLs. It can be stale or incomplete and will not discover newly published sources; graph construction and live-search complexity are unnecessary for the current corpus/use case. |
| Recursive character chunks, 1000 characters with 100 overlap | Whole-document retrieval; fixed token chunks; sentence/semantic chunking | Character splitting is simple and preserves heading/paragraph boundaries while bounding retrieved context. It is not token-count based or semantic, so chunk lengths in tokens vary and a concept can still cross chunk boundaries. |
| PostgreSQL pgvector | Chroma; hosted vector database | pgvector keeps relational records and embeddings in the existing PostgreSQL service, reducing infrastructure and enabling SQL plus vector search over one data store. It adds a PostgreSQL extension requirement and shares database capacity with application traffic; a hosted vector database can offer more specialized scaling and operations. |
| OpenAI embeddings and configurable OpenAI chat model | Self-hosted/open-source models; other model vendors | A single supported integration keeps embedding and generation wiring compact. It incurs provider usage costs and depends on API credentials/network availability; model substitution is possible for chat via `CODIFY_MODEL`, while the embedding model is currently fixed in code. |
| JSON-parsed model output, with application link filtering | Free-form prose; more elaborate schema-constrained generation | JSON maps directly to task records and the UI. Parsing can fail on malformed output, and URL filtering constrains links but does not guarantee task correctness; production hardening could add schema validation/retries. |
| Next.js same-origin proxy with signed JWT to FastAPI | Expose FastAPI directly to browsers; shared session lookup on every request | The proxy keeps backend configuration server-side and gives the backend a verifiable user identity without sharing NextAuth internals. It adds proxy code and requires the signing secret to match across services. |

These alternatives describe the design tradeoffs implied by the implementation, not necessarily a record of formal benchmark experiments.

## Main user flows

- Sign in with Google, LinkedIn, or email/password; sessions use JWT strategy.
- Complete onboarding and generate a personalized roadmap using RAG context.
- Browse curated roadmaps and fork one into a user's personal roadmaps.
- View, edit, reorder, and track tasks and deliverables; manage deadlines.
- Regenerate a roadmap from user feedback, recording non-empty feedback in `FeedbackLog`.
- Admin routes expose operational management and knowledge-base statistics.

Protected backend resources scope roadmap/task/deadline access to the authenticated user. The backend token is a bearer JWT signed with `JWT_SECRET` or `NEXTAUTH_SECRET` and uses HS256; the Next.js proxy and backend must share the secret.

## Repository layout

```text
backend/
  main.py                    FastAPI routes and orchestration
  auth.py                    Backend JWT validation
  database.py                SQLModel entities and database session
  generator.py               Prompts, LLM chains, task/link post-processing
  knowledge_base.py          Markdown ingestion and pgvector retrieval
  seed_data/knowledge/       Curated RAG Markdown corpus and URL metadata
  seed_data/*.json           Curated roadmap examples
  tests/                     Backend tests
  scripts/                   RAG quality, seed, and admin utilities
frontend/codify/
  app/                       Next.js routes and pages
  app/api/                   Auth, registration, onboarding, backend proxy
  components/                UI components
  lib/                       Auth, Prisma, backend API helpers
  prisma/                    Prisma schema and migrations
```

## Local development

### Prerequisites

- Node.js and npm compatible with the installed Next.js version
- Python 3.10+ (the backend uses modern Python type syntax)
- PostgreSQL
- An OpenAI API key for embeddings and chat generation

Configure environment variables in the appropriate process environments (do not commit secrets):

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Frontend and backend | Shared PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Next.js; backend fallback | NextAuth session/JWT signing secret; can also be used by backend token validation |
| `JWT_SECRET` | Backend | Preferred secret for validating proxy-signed backend bearer tokens; must match the proxy's signer configuration |
| `BACKEND_API_URL` | Next.js | Private base URL for FastAPI server-side calls and proxy forwarding |
| `OPENAI_API_KEY` | Backend | OpenAI embeddings and chat API access |
| `CODIFY_MODEL` | Backend, optional | Chat model; defaults to `gpt-4o-mini` |
| `PGVECTOR_COLLECTION` | Backend, optional | pgvector collection/table name; defaults to `roadmap_knowledge` |
| `CORS_ORIGINS` | Backend, optional | Comma-separated allowed origins; defaults to no explicit origins |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Next.js, optional | Google OAuth credentials |
| `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Next.js, optional | LinkedIn OAuth credentials |

The backend database module has a local fallback URL `postgresql://codify:codify@localhost:5432/codify`; set `DATABASE_URL` explicitly for real deployments. The frontend README documents a database initialization script; check the script in the checkout for the required local setup.

### Start the services

Frontend (from `frontend/codify`):

```bash
npm install
npm run db:init
npm run dev
```

Backend (from `backend`, with the PostgreSQL service available and backend variables configured):

```bash
python -m venv .venv
# Activate the virtual environment for your shell, then:
pip install -r requirements.txt
uvicorn main:app --reload
```

The frontend runs at `http://localhost:3000`; FastAPI's default Uvicorn address is `http://127.0.0.1:8000`. Set `BACKEND_API_URL` accordingly. Build the RAG collection after configuring `OPENAI_API_KEY`:

```bash
cd backend
python knowledge_base.py
```

## Verification and maintenance

Backend tests are under `backend/tests` and can be run with `python -m pytest` from `backend` after installing `requirements-dev.txt`. Frontend scripts include `npm run lint`, `npm run build`, and `npm test` from `frontend/codify`. The frontend test command currently uses `--passWithNoTests`, so a successful run may mean no frontend tests were discovered.

When changing schema fields, keep `frontend/codify/prisma/schema.prisma` and `backend/database.py` aligned with the shared PostgreSQL schema and apply the appropriate Prisma migration. After changing the Markdown corpus or URL metadata, rebuild the pgvector collection so the persisted index reflects the new documents.
