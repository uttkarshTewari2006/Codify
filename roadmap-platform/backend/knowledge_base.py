import os
import json
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

class KnowledgeBase:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.collection_name = "roadmap_knowledge"
        self.embeddings = None
        self.vector_store = None
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

    def ingest_knowledge_docs(self, docs_dir: Optional[str] = None):
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

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n## ", "\n### ", "\n", " ", ""]
        )

        documents = []
        for filename in os.listdir(docs_dir):
            if filename.endswith(".md"):
                file_path = os.path.join(docs_dir, filename)
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
                
                chunks = text_splitter.split_text(text)
                for i, chunk in enumerate(chunks):
                    doc = Document(
                        page_content=chunk,
                        metadata={
                            "source": filename,
                            "type": "knowledge_doc",
                            "chunk": i
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
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata
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
