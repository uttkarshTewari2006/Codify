import json
from unittest.mock import MagicMock, mock_open, patch

from langchain_core.documents import Document

from knowledge_base import KnowledgeBase


def build_test_kb() -> KnowledgeBase:
    kb = KnowledgeBase.__new__(KnowledgeBase)
    kb.vector_store = MagicMock()
    kb.collection_name = "roadmap_knowledge"
    kb.persist_directory = "/tmp/test_chroma"
    kb.is_available = lambda: True
    return kb


def test_extract_urls():
    urls = KnowledgeBase.extract_urls(
        "Useful docs: https://roadmap.sh/backend and https://fastapi.tiangolo.com/tutorial/."
    )

    assert urls == [
        "https://roadmap.sh/backend",
        "https://fastapi.tiangolo.com/tutorial/",
    ]


def test_kb_query_formatting():
    kb = build_test_kb()
    mock_doc = Document(
        page_content="React is a library.",
        metadata={"source": "test.md", "urls": ["https://react.dev/learn"]},
    )
    kb.vector_store.similarity_search.return_value = [mock_doc]

    results = kb.query("What is React?", top_k=1)

    assert len(results) == 1
    assert results[0]["content"] == "React is a library."
    assert results[0]["metadata"]["source"] == "test.md"
    assert results[0]["metadata"]["urls"] == ["https://react.dev/learn"]
    kb.vector_store.similarity_search.assert_called_once_with("What is React?", k=1)


def test_load_source_metadata():
    metadata_json = json.dumps(
        {
            "test.md": {
                "urls": [
                    "https://react.dev/learn",
                    "https://react.dev/learn",
                    "https://nextjs.org/docs.",
                ]
            }
        }
    )

    with patch("knowledge_base.os.path.exists", return_value=True), patch(
        "builtins.open",
        mock_open(read_data=metadata_json),
    ):
        metadata = KnowledgeBase.load_source_metadata("knowledge")

    assert metadata == {
        "test.md": {
            "urls": [
                "https://react.dev/learn",
                "https://nextjs.org/docs",
            ]
        }
    }


def test_kb_get_stats():
    kb = build_test_kb()
    kb.vector_store._collection.count.return_value = 100

    stats = kb.get_stats()

    assert stats["total_chunks"] == 100
    assert stats["collection_name"] == "roadmap_knowledge"
