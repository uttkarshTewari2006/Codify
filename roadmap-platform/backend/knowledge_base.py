import json
import os
import re
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

URL_PATTERN = re.compile(r"https?://[^\s)\]>\"']+")
SOURCE_METADATA_FILENAME = "metadata.json"

class KnowledgeBase:
    def __init__(self, persist_directory: Optional[str] = None):
        default_persist_directory = os.getenv(
            "CHROMA_PERSIST_DIR",
            os.path.join(os.path.dirname(__file__), "chroma_db"),
        )
        self.persist_directory = os.path.abspath(persist_directory or default_persist_directory)
        self.collection_name = "roadmap_knowledge"
        self.embeddings = None
        self.vector_store = None
        self._vector_store_cls = None
        self._init_error = None

        try:
            from langchain_openai import OpenAIEmbeddings
            from langchain_chroma import Chroma
        except ImportError as exc:
            self._init_error = (
                "Knowledge base dependencies are missing. Install "
                "'langchain-chroma' and 'langchain-text-splitters' to enable RAG-backed features."
            )
            print(f"[KnowledgeBase] Disabled: {exc}")
            return

        try:
            self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
            self._vector_store_cls = Chroma
            self.vector_store = Chroma(
                collection_name=self.collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            )
        except Exception as exc:
            self._init_error = f"Knowledge base initialization failed: {exc}"
            print(f"[KnowledgeBase] {self._init_error}")

    def is_available(self) -> bool:
        return self.vector_store is not None

    def get_unavailable_reason(self) -> str:
        return self._init_error or "Knowledge base is unavailable."

    @staticmethod
    def extract_urls(text: str) -> List[str]:
        urls = [url.rstrip(".,;:") for url in URL_PATTERN.findall(text or "")]
        return list(dict.fromkeys(urls))

    @staticmethod
    def load_source_metadata(docs_dir: str) -> Dict[str, Dict[str, List[str]]]:
        metadata_path = os.path.join(docs_dir, SOURCE_METADATA_FILENAME)
        if not os.path.exists(metadata_path):
            return {}

        with open(metadata_path, "r", encoding="utf-8") as f:
            raw_metadata = json.load(f)

        normalized_metadata: Dict[str, Dict[str, List[str]]] = {}
        for source, metadata in raw_metadata.items():
            if isinstance(metadata, dict):
                urls = metadata.get("urls", [])
            else:
                urls = metadata

            normalized_urls = []
            for url in urls or []:
                if not isinstance(url, str):
                    continue
                cleaned = url.strip().rstrip(".,;:")
                if cleaned and cleaned not in normalized_urls:
                    normalized_urls.append(cleaned)

            normalized_metadata[source] = {"urls": normalized_urls}

        return normalized_metadata

    def reset_collection(self) -> None:
        if not self.is_available():
            raise RuntimeError(self.get_unavailable_reason())

        try:
            self.vector_store._client.delete_collection(self.collection_name)
        except Exception:
            pass

        self.vector_store = self._vector_store_cls(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.persist_directory,
        )

    def ingest_knowledge_docs(self, docs_dir: Optional[str] = None, replace_existing: bool = True):
        """
        Parses markdown files in the docs_dir and adds them to ChromaDB.
        Uses recursive character splitting for better context preservation.
        """
        if not self.is_available():
            raise RuntimeError(self.get_unavailable_reason())

        from langchain_core.documents import Document
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        if docs_dir is None:
            docs_dir = os.path.join(os.path.dirname(__file__), "seed_data", "knowledge")

        if not os.path.exists(docs_dir):
            print(f"Docs directory not found: {docs_dir}")
            return

        if replace_existing:
            self.reset_collection()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n## ", "\n### ", "\n", " ", ""]
        )
        source_metadata = self.load_source_metadata(docs_dir)

        documents = []
        for filename in os.listdir(docs_dir):
            if filename.endswith(".md"):
                file_path = os.path.join(docs_dir, filename)
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()

                source_urls = source_metadata.get(filename, {}).get("urls")
                if not source_urls:
                    source_urls = self.extract_urls(text)

                chunks = text_splitter.split_text(text)
                for i, chunk in enumerate(chunks):
                    doc = Document(
                        page_content=chunk,
                        metadata={
                            "source": filename,
                            "type": "knowledge_doc",
                            "chunk": i,
                            "urls": list(source_urls),
                        }
                    )
                    documents.append(doc)

        if documents:
            self.vector_store.add_documents(documents)
            print(f"Ingested {len(documents)} chunks from {docs_dir}.")

    def query(self, query_text: str, top_k: int = 5) -> List[Dict]:
        """
        Queries the vector store for the most relevant tasks/concepts.
        """
        if not self.is_available():
            return []

        results = self.vector_store.similarity_search(query_text, k=top_k)

        formatted_results = []
        for doc in results:
            metadata = dict(doc.metadata or {})
            metadata["urls"] = metadata.get("urls") or self.extract_urls(doc.page_content)
            formatted_results.append({
                "content": doc.page_content,
                "metadata": metadata
            })
        return formatted_results

    def get_stats(self) -> Dict:
        """
        Returns stats about the vector store for the admin dashboard.
        """
        if not self.is_available():
            return {
                "available": False,
                "error": self.get_unavailable_reason(),
                "collection_name": self.collection_name,
                "persist_directory": self.persist_directory
            }

        try:
            # Note: chroma collection counts can be obtained via the client 
            # but langchain wrapper doesn't expose it directly in a standard way
            # We will use the underlying collection directly
            count = self.vector_store._collection.count()
            return {
                "available": True,
                "total_chunks": count,
                "collection_name": self.collection_name,
                "persist_directory": self.persist_directory
            }
        except Exception as e:
            return {"error": str(e)}

# If run directly, can be used as a CLI for indexing
if __name__ == "__main__":
    kb = KnowledgeBase()
    
    # Ingest extra knowledge docs
    kb.ingest_knowledge_docs()
    
    # Print stats
    print("Database Stats:", kb.get_stats())
