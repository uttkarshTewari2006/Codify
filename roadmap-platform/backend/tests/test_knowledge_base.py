import pytest
from knowledge_base import KnowledgeBase
from unittest.mock import MagicMock, patch
from langchain_core.documents import Document

@pytest.fixture
def mock_kb():
    with patch("knowledge_base.Chroma") as mock_chroma:
        with patch("knowledge_base.OpenAIEmbeddings") as mock_embeddings:
            kb = KnowledgeBase(persist_directory="/tmp/test_chroma")
            # Inject mock vector store
            kb.vector_store = MagicMock()
            yield kb

def test_kb_query_formatting(mock_kb):
    # Setup mock return value
    mock_doc = Document(page_content="React is a library", metadata={"source": "test.md"})
    mock_kb.vector_store.similarity_search.return_value = [mock_doc]
    
    results = mock_kb.query("What is React?", top_k=1)
    
    assert len(results) == 1
    assert results[0]["content"] == "React is a library"
    assert results[0]["metadata"]["source"] == "test.md"
    mock_kb.vector_store.similarity_search.assert_called_once_with("What is React?", k=1)

def test_kb_get_stats(mock_kb):
    mock_kb.vector_store._collection.count.return_value = 100
    
    stats = mock_kb.get_stats()
    
    assert stats["total_chunks"] == 100
    assert stats["collection_name"] == "roadmap_knowledge"
