from generator import collect_allowed_urls, format_retrieved_context, sanitize_task_links


def test_rag_url_filtering_only_keeps_retrieved_urls():
    results = [
        {
            "content": "Backend foundations with docs at https://fastapi.tiangolo.com/tutorial/",
            "metadata": {
                "source": "01-backend-foundations.md",
                "urls": ["https://fastapi.tiangolo.com/tutorial/"],
            },
        }
    ]
    tasks = [
        {
            "title": "Learn FastAPI",
            "links": [
                "https://fastapi.tiangolo.com/tutorial/",
                "https://hallucinated.example.com",
            ],
        }
    ]

    allowed_urls = collect_allowed_urls(results)
    sanitized_tasks = sanitize_task_links(tasks, allowed_urls)
    formatted_context = format_retrieved_context(results)

    assert sanitized_tasks[0]["links"] == ["https://fastapi.tiangolo.com/tutorial/"]
    assert "Source URLs:" in formatted_context
    assert "https://fastapi.tiangolo.com/tutorial/" in formatted_context


def test_existing_roadmap_urls_are_allowed_during_regeneration():
    results = []
    existing_roadmap = {
        "tasks": [
            {
                "title": "Read docs",
                "links": ["https://roadmap.sh/full-stack"],
            }
        ]
    }

    allowed_urls = collect_allowed_urls(results, existing_roadmap=existing_roadmap)

    assert "https://roadmap.sh/full-stack" in allowed_urls
