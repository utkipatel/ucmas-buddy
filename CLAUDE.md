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
3. For each task: create a branch from `main`, write tests for the logic
   first, implement, then open a pull request that says `Closes #<issue#>`.
   The user reviews and merges.
4. If a requested change alters behavior, update the spec first and get
   approval before writing code.

## Branches and pull requests

- One branch and one pull request per task. Branch name:
  `<type>/<issue#>-short-name`, for example `feat/12-abacus-model`. Small
  changes without an issue use `<type>/short-name`.
- PRs are squash-merged, and the PR title becomes the single commit on
  `main`, so **PR titles must follow the commit format below**.
- GitHub deletes merged branches automatically. Locally, clean up with
  `git switch main && git pull && git fetch --prune`.
- Never push to `main` directly or merge a pull request without asking.

## Commit messages (Conventional Commits)

- Exactly **one line**: `type: description`. Lowercase, imperative, no
  trailing period, at most 72 characters. No body and no trailers (no
  `Co-Authored-By`).
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.
- Examples: `feat: add digit-to-bead conversion`,
  `docs: add study mode plan`, `chore: set up eslint and prettier`.

## Keeping diffs small

- Aim for under about 300 changed lines per PR, not counting generated files
  such as `package-lock.json`. If a task looks bigger, split the issue first.
- Each commit is one logical step that still builds and passes tests.
- Don't mix in unrelated changes (formatting, renames, drive-by fixes). Put
  them in their own PR.

## Code style

- Enforced by tools, not by hand: Prettier (formatting), ESLint (bug-prone
  code), TypeScript strict mode. CI runs them on every PR, and a PR can't be
  merged while checks fail.
- Stack: Vite + TypeScript + Vitest (details in the epic's `plan.md`).
- Keep docs in plain, simple English. Refer to the person using the app as
  "the learner", never a specific person.

## Commands

See `README.md` (added with the project scaffold).
