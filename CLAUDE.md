# UCMAS Buddy

A static web app for practicing reading numbers on a UCMAS (soroban-style)
abacus. Personal learning project, also used to practice spec-driven
development.

## How we work (spec-driven)

1. `docs/SPEC.md` is the source of truth for **what** the app does. If a
   requested change alters behavior, update the spec first and get approval
   before writing code.
2. `docs/PLAN.md` describes **how**: stack, file layout and data model.
3. `docs/TASKS.md` lists small tasks. Do one task at a time, and link each one
   to the acceptance criteria (AC1, AC2, …) it covers.
4. For each task: write tests for the logic first, implement, show the diff
   for review, then make one small commit.

## Conventions

- Stack: Vite + TypeScript + Vitest (details in `docs/PLAN.md` once written).
- Keep docs in plain, simple English. Refer to the person using the app as
  "the learner", never a specific person.
- Commit messages: short imperative subject line, for example
  `Add digit-to-bead conversion`.
- Don't push or deploy without asking.

## Commands

To be added once the project is scaffolded (dev server, tests, build).
