---
name: "tacs-ai-playbook"
description: "Team AI playbook for the TACS TP: scope, workflow, commit titles, and review checklist."
---

# TACS AI Playbook

Purpose: align AI assistants across tools with consistent, low-overhead practices for this academic TP.

## Scope and priorities

- Academic TP: prefer simple solutions and minimal docs.
- Avoid over-engineering, heavy infra, or refactors not requested.
- Prefer incremental, readable changes aligned with current architecture.

## Workflow

1. Understand the request and map it to repo behavior and (if applicable) the enunciado.
2. Ask clarifying questions for ambiguities; provide short options with a recommendation.
3. Propose a concise change plan (what to modify/add/remove, modules touched, tests to run).
4. Implement only after explicit approval for non-trivial changes.
5. Validate with relevant tests/lint/typecheck when meaningful.

## Code quality

- TypeScript-first; avoid unsafe any unless justified.
- Keep controller/service separation; consistent error handling.
- Preserve API compatibility unless explicitly approved.
- Keep functions small and cohesive; avoid hidden side effects.

## Commit titles (Conventional Commits)

Format: type(scope): summary (scope optional).
Types: feat, fix, chore, refactor, test, docs.
Rules: summary in imperative, <= 72 chars, no trailing period.

Examples:

- feat(auth): add refresh token flow
- fix(posts): handle empty image list
- chore: update lint config

## Review checklist

- Meets requirement and matches current behavior.
- Edge cases and validation handled.
- API contracts and OpenAPI updated when endpoints change.
- Tests updated or added when logic changes.
- Performance acceptable for expected data size.
- No secrets or credentials in code.

## Documentation

- Keep README updates short and only when behavior or setup changes.
- Avoid long docs or re-architecting the TP.
