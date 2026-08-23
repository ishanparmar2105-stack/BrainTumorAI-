# Contributing Guide — BrainTumorAI

Thank you for contributing to BrainTumorAI. Please follow these guidelines to keep the codebase clean, readable, and robust.

---

## 1. Code Style Guidelines

### 1.1 Python (Backend & ML)
- **Formatting**: Use Black or Ruff to format code.
- **Linting**: Keep code clean of unused imports or syntax warnings. Run `ruff check .`.
- **Type Hints**: Always use Python type hints for function definitions.
  - Example: `def hash_password(password: str) -> str:`
- **Naming**: Use `snake_case` for variables and functions, `CamelCase` for classes.

### 1.2 TypeScript & React (Frontend)
- **Formatting**: Use Prettier.
- **Linting**: Follow project rules. Run `npm run lint`.
- **TypeScript**: Avoid using `any`. Define interfaces in `src/types/index.ts`.

---

## 2. Testing Before Commits

### 2.1 Running Pytest
Always run tests to ensure your changes didn't break core features:
```bash
/opt/homebrew/bin/python3.11 -m pytest tests/ -v
```
All tests must pass.

### 2.2 Verifying Frontend Build
Compile the frontend to make sure TypeScript types align perfectly:
```bash
cd frontend
npm run build
```
Ensure it completes with zero errors.
