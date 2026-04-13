---
description: "QA & Testing Standards for the Codify Roadmap Platform"
globs: ["backend/tests/**/*", "frontend/codify/__tests__/**/*", "frontend/codify/playwright/**/*", "vitest.config.ts", "playwright.config.ts", "pytest.ini"]
alwaysApply: false
---

# QA Guidelines for AI Agent

Use @webapp-testing for Playwright E2E setup, @tdd-workflows-tdd-red for writing failing tests (Vitest and pytest patterns), and @systematic-debugging when any test fails.

## 1. Allowed Test Directories
- **Backend:** `backend/tests/**/*` only.
- **Frontend unit/integration:** `frontend/codify/__tests__/**/*` only.
- **Frontend E2E:** `frontend/codify/playwright/**/*` only.
- **Config files:** `vitest.config.ts`, `playwright.config.ts`, `pytest.ini`.
- Do NOT place test files outside these paths.

## 2. Frontend Tests — Vitest + Playwright
- Use **Vitest** with `@testing-library/react`. Mock with `vi.fn()` / `vi.mock()`.
- Use **Playwright** for E2E. Wait for `networkidle` before asserting. Use semantic selectors (`getByRole`, `data-testid`).
- Follow AAA pattern. One behavior per test. Name: `should_<expected>_when_<condition>`.
- Coverage: **80% line**, **75% branch**, **100% critical paths**.

## 3. Backend Tests — pytest + AI Mocking
- Use **pytest** with fixtures (`function`/`session` scope) and `@pytest.mark.parametrize`.
- **AI mocking is mandatory:** use `pytest-mock` for internal patches and `respx` to intercept all outbound HTTP calls to LLM providers. Never call real AI APIs in tests.
- Store canned responses in `backend/tests/fixtures/` as JSON files.
- Coverage: **80% line**, **75% branch** via `pytest-cov`.

## 4. Workflow
- **RED:** Write a failing test first. Verify it fails for the right reason.
- **GREEN:** Write minimal code to pass. No extras.
- **REFACTOR:** Clean up while all tests stay green.
- If a test fails unexpectedly, follow @systematic-debugging — find root cause before fixing.
