# Contributing code

For content authoring and validation, see [content/AGENTS.md](../content/AGENTS.md).

## Code Structure

| Path                  | Purpose and boundaries                                                           |
| --------------------- | -------------------------------------------------------------------------------- |
| `content/`            | Question banks and blog posts. Read-only at runtime.                             |
| `src/database/`       | Drizzle schema and migrations. No dependencies.                                  |
| `src/libs/base/`      | Generic framework and JS utilities. No imports.                                  |
| `src/libs/core/`      | Business logic. Imports base and external packages only.                         |
| `src/libs/providers/` | External integrations only.                                                      |
| `src/libs/ui/`        | React UI. May use base. Keep types independent of core and DB types.             |
| `src/libs/ui/hooks/`  | UI hooks.                                                                        |
| `src/libs/ui/utils/`  | UI utilities.                                                                    |
| `src/routes/`         | Fetch via providers, transform in core, render with UI.                          |
| `src/routes/-hooks/`  | Route-specific business hooks. May call providers and shape UI data.             |
| `src/tools/`          | Scripts outside runtime. May use providers, core and base. Keep tool logic here. |
| `src/slop/`           | Self-contained AI scripts with no dependencies.                                  |

## Style

- Use arrow functions. Classes are reserved for providers.
- Add comments or docs only when asked.
- Omit control-flow braces when the statement fits in 80 chars (`if (!id) return null;`). Use braces for multiline bodies and explicit returns in multiline arrows.
- Avoid nested or parenthesised `await` chains. Name intermediates and parse separately from reads.
- Keep inputs immutable. Build values with `map`, `filter`, `reduce` or `Array.from`. Prefer `toSorted` and don't use `let` unless authorized.
- Wrap non-trivial Tailwind classes in `cn` and split at 80 chars. Use design-system sizes such as `size-8.5`.
- Import `{ z }` from `zod/mini` and type schemas with `satisfies z.ZodMiniType<T>`.

## Files

- Use kebab-case filenames and one main export named after the file. Keep helpers private. Constants and props types may also be exported. Exceptions include definition-only files, repetitive utilities and `toaster.tsx`.
- Order definitions as imports, types, constants, helpers, subcomponents, then main export. Define before use.
- Delete unused code.

## React components

- Use one `useState` per concern. Store per-item state in arrays or by index.
- Wrap callbacks defined in hooks or components in `useCallback` and derived objects passed down in `useMemo`.
- Use `FC` with inline props. Keep caller types private and inline single-use types. Put one object type member per line.
- Boolean React props use names like `open` and `disabled`. Plain values and hook returns keep `is`, as in `isOpen`.
- Order component bodies as state, memoised values and callbacks, plain JS, effect hooks (including effect-only custom hooks), then return.
- Extract only non-trivial logic or logic reused across files.

## Names

- Use unique imperative function names (`calculateTimeAvailable`), declarative component names (`TimeAvailable`) and page names ending in `Page`.
- Avoid adjacent capitals (`atplAirplane`). DB table names may keep `atpl_a_`.
- Name formatters `format[Input]As[Output]` in `libs/base/format-values.ts`. Use `DD/MM/YY` for ShortDate and “2 February 1929” for LongDate.
- Use descriptive variables except in one-line collection callbacks.

## UI

- Default mobile gutters and content spacing to 8 px (`p-2`, `gap-2`).
- Prefer domain props like `type="wallet"` over column lists or flags.
- Add a design-system story for each new UI component unless told otherwise.
- Keep dialogs the same size across content and loading states. Scroll inside a fixed-height body.
- Use `createLink` at page level. Use `Link` for text links.
- Markdown body uses 400 weight at 80% ink and 13 px (14 px for questions). Headings use 700. Bold uses 800 at full ink (70% from muted to ink in quotes) and stays distinct in dark mode.
- Extend `libs/ui/utils/convert-latex-as-mathml.ts` for missing LaTeX commands. For `$$` blocks with `&` or `\\\\`, use an HTML grid of `<math>` cells with the left column right-aligned, the right column left-aligned and shared baselines. Chrome ignores alignment on `mtd`.

## TanStack routes

- Name page components after their route file with a `Page` suffix (`ContentPage`). Append `Data` to the page’s server function (`ContentPageData`). Export it if nested pages reuse it.
- Order `createFileRoute` options as `component`, one-line data options such as `validateSearch`, one-line functions, `loader`, then `head`.
- Set complete page metadata with `buildPageHead`.
- Keep server-only and design-system-only imports out of route files. Check the entry chunk with `vite build --sourcemap`.

## Scripts

- Keep scratch work in untracked `.workdir/`.
- Put repo AI scripts in `src/slop/<descriptive-name>`, one file per task (no imports, no abstractions). Extract into libs only when asked.

## Content pipeline

- Edit YAML in `content/question-bank-<bank>/`. For format changes, update `libs/core/content/question-bank-raw-*.ts` first, then the YAML and compiler.
- `tools/compile-question-banks.ts` validates YAML and references, selects the latest learning-objective version and writes `QuestionBankFile` to the ignored `generated/question-banks/<bank>/index.json`. Regenerate it from YAML.
- `tools/vite-content-assets.ts` compiles at dev startup, on bank YAML changes and during builds. It serves annexes at `/content/annexes/<bank>/` in dev and copies them to `public/content/annexes/` for builds.
- `getQuestionBankDb().getQuestionBank(name)` in `libs/providers/question-bank-db.ts` loads the JSON and caches the in-memory `QuestionBankIndex`. `libs/core/question-bank/get-question-bank-index-from-raw.ts` builds maps, resolves annexes and generates variant previews. In-memory search lives in `libs/core/search/search-questions.ts`.
