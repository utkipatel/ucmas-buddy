# UCMAS Buddy

Practice reading numbers on a UCMAS (soroban-style) abacus. The app shows a
random number as beads; the learner reads it out loud and checks the answer.
Built with Vite, React and TypeScript.

**Try it:** https://utkipatel.github.io/ucmas-buddy/ (works on phones,
tablets and laptops; on iPhone or iPad, use Share → Add to Home Screen)

## Setup

Needs Node 26 or later.

```sh
npm install
```

## Commands

| Command              | What it does                          |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the dev server with live reload |
| `npm test`           | Run unit tests once                   |
| `npm run test:watch` | Run tests again on every save         |
| `npm run typecheck`  | Check TypeScript types                |
| `npm run lint`       | Check code with ESLint                |
| `npm run format`     | Format all files with Prettier        |
| `npm run build`      | Build the static site into `dist/`    |
| `npm run check`      | Run every check CI runs, in order     |

Every merge to `main` is published to GitHub Pages by
`.github/workflows/deploy.yml`.

## Project docs

- `CLAUDE.md`: how we work (workflow, commit rules, code style)
- `docs/specs/`: one folder per epic, with its spec and plan
- Work is tracked in [GitHub Issues](https://github.com/utkipatel/ucmas-buddy/issues)
