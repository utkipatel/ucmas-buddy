# UCMAS Buddy

A static web app for practicing reading numbers on a UCMAS (soroban-style)
abacus. Personal learning project, also used to practice spec-driven
development with an industry-style GitHub workflow.

## Current work

No epic in progress. The user picks the next one from the backlog
(issues labeled `epic`): #4 calculation practice, #6 decimals, #7
progress over time. Start it as in "How we work".

Done (frozen): epic 001, study mode (`docs/specs/001-study-mode/`),
epic 002, vanish mode (`docs/specs/002-vanish-mode/`), epic 003, play
and test modes (`docs/specs/003-modes/`) and epic 004, voice input
(`docs/specs/004-voice-input/`; see its spec's known limitation).

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
2. Write `plan.md`, get approval, then create task issues from it. The
   plan marks each task's review: **user** or **auto** (see "Who merges").
3. For each task: create a branch from `main`, write tests for the logic
   first, implement, then open a pull request that says `Closes #<issue#>`.
   Run `/code-review` on it and fix what it finds. Then the PR is merged
   as its review says.
4. If a requested change alters behavior, update the spec first and get
   approval before writing code.
5. When all tasks are merged, the user tries the epic in the deployed app
   (on a phone and a computer) before it's marked Done.

## Branches and pull requests

- One branch and one pull request per task. Branch name:
  `<type>/<issue#>-short-name`, for example `feat/12-abacus-model`. Small
  changes without an issue use `<type>/short-name`.
- The user picks the merge method for each PR. Two are enabled:
  - **Squash** (the default): one commit on `main`. The PR title becomes
    the commit subject and the PR description becomes the commit body.
    Use it when the branch has work-in-progress or review-fix commits.
  - **Rebase**: each branch commit lands on `main` as is. Use it when
    every commit is a meaningful step worth keeping on its own.
- So **PR titles must follow the commit format below**, PR descriptions
  should read well as a commit body (what changed, why, how to test), and
  every commit on a branch should be clean enough to land on `main` by
  itself. Review discussion goes in PR comments, not the description.
- Wrap PR description lines at 72 characters or fewer. GitHub rewraps
  longer lines in the squash commit body, which breaks sentences badly.
- Start every comment Claude posts on GitHub (PR or issue) with
  `🤖 Claude comment` on its own line, so the user can tell their own
  comments from Claude's at a glance.
- GitHub deletes merged branches automatically. Locally, clean up with
  `git switch main && git pull && git fetch --prune`.
- Never push to `main` directly.

## Who merges

Every merge to `main` deploys the app, so merging is shipping.

- **User review:** the user reviews and merges. This is the default, and
  always applies to: spec and plan PRs, screens and anything the learner
  sees, browser features (microphone, storage, timers), new or updated
  dependencies, CI and deploy workflows, and this file.
- **Auto review:** Claude may squash-merge on its own when all of these
  hold:
  - the approved plan marks the task **auto** (logic with tests, no
    screen changes);
  - CI passes;
  - `/code-review` found nothing left to fix;
  - the PR stays within about 300 changed lines.

  Before merging, Claude posts a PR comment saying what was checked, and
  tells the user in the session. If any of these fail, or Claude is
  unsure, the PR waits for the user.
- The user can turn any **auto** task into **user** at any time.

## Commit messages (Conventional Commits)

- **Subject line required:** `type: description`. Lowercase, imperative, no
  trailing period, at most 72 characters.
- **Body optional:** add one, after a blank line, only when the why isn't
  obvious from the subject. Wrap at 72 characters.
- No trailers (no `Co-Authored-By`).
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.
- Examples: `feat: add digit-to-bead conversion`,
  `docs: add study mode plan`, `chore: set up eslint and prettier`.

## Keeping diffs small

- Guideline, not a hard limit: aim for under about 300 changed lines per PR,
  not counting generated files such as `package-lock.json`. If a task looks
  much bigger, consider splitting the issue first. Larger PRs are fine when
  splitting would make the change harder to follow; say why in the PR
  description.
- Each commit is one logical step that still builds and passes tests.
- Don't mix in unrelated changes (formatting, renames, drive-by fixes). Put
  them in their own PR.

## Code style

- Enforced by tools, not by hand: Prettier (formatting), ESLint (bug-prone
  code), TypeScript strict mode. CI runs them on every PR, and a PR can't be
  merged while checks fail.
- Stack: Vite + React + TypeScript + Vitest (details in the epic's `plan.md`).
- Keep docs in plain, simple English. Refer to the person using the app as
  "the learner", never a specific person.

## Commands

See `README.md` (added with the project scaffold).
