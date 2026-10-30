# UCMAS Buddy

A static web app for practicing reading numbers on a UCMAS (soroban-style)
abacus. Personal learning project, also used to practice spec-driven
development with an industry-style GitHub workflow.

## Current work

Epic 001, study mode: `docs/specs/001-study-mode/`, GitHub milestone
"001 Study mode". Pick the lowest-numbered open task issue in that milestone.

## Where things live

- **Repo, `docs/specs/NNN-name/`:** one folder per epic.
  - `spec.md` covers **what** and **why**, with acceptance criteria (AC1, AC2, …).
  - `plan.md` is the technical design: **how**.
  - Both are frozen once the epic ships. Don't edit a Done epic's docs.
- **GitHub Issues:** all work tracking.
  - Label `epic`: one issue per epic, including future ideas (the backlog).
  - Label `task`: small work items. Each belongs to its epic's milestone
    and names the acceptance criteria it covers.
- `gh` is installed at `/opt/homebrew/bin/gh` (it may not be on PATH).

## How we work

1. A new epic starts from its epic issue: write `spec.md`, get approval.
2. Write `plan.md`, get approval, then create task issues from it.
3. For each task: create a branch (`task/<issue#>-short-name`), write tests
   for the logic first, implement, then open a pull request that says
   `Closes #<issue#>`. The user reviews and merges.
4. If a requested change alters behavior, update the spec first and get
   approval before writing code.

## Conventions

- Stack: Vite + TypeScript + Vitest (details in the epic's `plan.md`).
- Keep docs in plain, simple English. Refer to the person using the app as
  "the learner", never a specific person.
- Commit messages: short imperative subject line, for example
  `Add digit-to-bead conversion`.
- Never push to `main` directly or merge a pull request without asking.

## Commands

To be added once the project is scaffolded (dev server, tests, build).
