# chair-flight

Aviation question banks app built with TanStack Start. This is the only agent file. Keep it and the CONTRIBUTING files current.

## Read first

Before any task, read the CONTRIBUTING files that match it. This is mandatory, not optional.

- Any code change: `src/CONTRIBUTING.md`.
- Anything quesiton banks `content/CONTRIBUTING.md`, `content/question-bank-<bank>/CONTRIBUTING.md`, and `content/question-bank-<bank>/private.md`.
- use `/.external` as a work directory for any content you download to use as a reference or sources.
- use `/.workdir` for any code, or ephemeral projects that you develop that is not intended to end up in the remote.

## Code Structure

- `libs/base`: no imports (internal or external).
- `libs/core/*`: may import external packages and base. Never calls external providers.
- `libs/providers/*`: external connections only. No business logic.
- `libs/ui`: UI code. May use base; avoid core.
- `libs/ui/components`: reusable, self-contained components. Never create React components here unless told.
- `routes/-server-functions/*`: builds data (providers → core → return). Mirrors core's folders; no cross-domain pulls (must not pull from core/finances).
- Question-bank pages own their data: each page file defines its `createServerFn({ method: "GET" }).middleware([staticFunctionMiddleware])` and calls it from `loader`, even when code repeats across pages. There is no shared `routes/-server-functions/question-banks` folder; never add one server function file per job or per bank.

## Content pipeline

- YAML in `content/` is the source of truth. `src/tools/compile-question-banks.ts` (run by the Vite plugin `src/tools/vite-content-assets.ts` at build, and on change in dev) validates it, keeps the latest learning-objective version and writes `generated/question-banks/<bank>/index.json` (untracked, never edit).
- `libs/core/content/question-bank-raw-*.ts`: one zod schema (with its inferred type) per file, exactly as stored in YAML, composed from `-metadata` (id, titles, description, annexes, courses, subjects, chapters), `-annex`, `-learning-objective` and `-question`. Change the schema first, then the YAML and compiler. Bank names: `question-bank-name.ts`.
- `question-bank-file.ts` is what the compiler writes (raw types assembled). `question-bank-index.ts` is what the app uses: the file plus annex `href`s, maps, and per question `previews` (one per variant) and `numberOfVariants`. `libs/core/question-bank/get-question-bank-index-from-raw.ts` converts one to the other, resolving `annex:` references and annotated annexes in templates (`resolve-question-templates.ts`); the other files there operate on the index.
- `libs/providers/question-bank-db.ts`: `getQuestionBankDb().getQuestionBank(name)` reads the file, builds the index (arrays plus `annexesMap`, `subjectsMap`, `chaptersMap`, `learningObjectivesMap`, `questionsMap`) and caches it. Content is never stored in the database; compile-time validation replaces foreign keys.
- Search is in memory: `libs/core/search/search-questions.ts`.
