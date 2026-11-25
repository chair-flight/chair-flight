# Contributing code

Architecture and layer rules are in [`AGENTS.md`](../AGENTS.md). Content rules are in [`content/CONTRIBUTING.md`](../content/CONTRIBUTING.md).

## Files

- kebab-case, one main export named after the file (function, component or hook). Helpers stay private.
- Static support exports (constants, props type) are allowed, never a second function, component or hook. Exceptions: definition-only files, repetitive util files, `toaster.tsx` (`Toaster.toast`, `Toaster.dismiss`).
- Order: imports, types, constants, helpers, sub components, main export. Read top to bottom: never use something defined below it. The main export is last.
- Delete unused code (git history recovers it).

## Functions and components

- Arrow functions assigned to variables, not declarations. Classes only for providers.
- Components are `FC` with props typed in place. Don't export types for callers or name a type used once.
- Object types: multi-line, one member per line.
- Boolean React props have no `is` prefix (`open`, `disabled`). Plain JS values and hook returns keep it (`isOpen` from `useDisclose`).
- Component body order: `useState`, `useMemo`/`useCallback`, plain JS, then all effect hooks, last, right before the `return`. Effect hooks are `useEffect`, `useLayoutEffect` and custom hooks that only run effects (`useKeyboardShortcuts`).
- Long functions and components are fine. No tiny abstractions (e.g. wrapping `new Intl.DateTimeFormat`): inline, and extract only if non-trivial or reused across files.

## Names

- Functions are imperative (`calculateTimeAvailable`), components declarative (`TimeAvailable`), pages `XPage` (`AccountsPage`).
- No two functions share a name in the codebase.
- No adjacent capitals (`atplAirplane`, not `atplA`). DB table names may keep `atpl_a_`.
- Format functions: `format[Input]As[Output]` in `libs/base/format-values.ts`. ShortDate `DD/MM/YY`, LongDate "2 February 1929".
- Descriptive variable names, except in one-liner functional code (`map`, `reduce`, `filter`): `template.presets.reduce((s, p) => s + p.correctAnswers.length, 0)`.

## Style

- No comments or docs unless asked.
- Braces follow line count: fits in 80 chars → none (`if (!id) return null;`); 2+ lines → braces, and arrow functions get a block body with explicit `return`.
- No nested or parenthesised `await` chains. Name each intermediate (`const unsortedFiles = await fs.readdir(…).catch(() => [])`, then `.filter(…).toSorted()`), and parse in a separate statement from the read.
- Prefer `toSorted` over `sort` on a value you do not own.
- Build values in one expression (`map`/`filter`/`reduce`/`Array.from`), not create-then-push. `let` is rare.
- Tailwind: wrap non-trivial classes in `cn`, split across lines, max 80 chars. Use design-system sizes (`size-8.5`, not `size-[34px]`).

## UI

- UI components may know business logic: prefer `type="wallet"` over passing column lists or flags. Never import DB/core types for it.
- New UI component → add a design-system story unless told otherwise.
- Modals and dialogs: fixed size regardless of content or loading; fixed-height body, overflow scrolls inside.
- Use `createLink` (at page level, not in the component library) instead of the `Link` component, unless it is a text link.
- Markdown: body 400 in 80% ink, 13px (questions 14px); bold 800 in full ink (in quotes: 70% of the way from muted to ink); headings 700. Bold must stay distinct in dark mode.
- Maths in explanations is rendered by `libs/ui/utils/convert-latex-as-mathml.ts`; extend it when a LaTeX command is missing instead of falling back to MathML. Aligned `$$` blocks (any block with `&` or `\\`) are an HTML grid of `<math>` cells (Chrome ignores `columnalign` and `text-align` on `mtd`; grid/flex on MathML elements breaks it): left column right-aligned, right column left-aligned, baseline aligned.

## Zod

- Browser code (route `validateSearch`, params validators, anything under `src/routes` or `libs/ui`) imports `{ z } from "zod/mini"` to keep the entry chunk small. It is functional: `z.optional(z.string())`, `z.catch(schema, undefined)`, `z._default`, `.check(z.minLength(1))`, `z.int()`.
- Full `zod` (chained methods) is for server/Node-only code: the `libs/core/content` raw schemas and the compiler. Never import a full-zod schema into a route or component.
- Keep route files free of imports only the server or design system need: one pulls it into the entry chunk (check with `vite build --sourcemap`).

## Routes and pages

- Page files start with static constants (`QUESTION_BANKS`, `PARAMS_VALIDATOR`). Every page under `question-banks` declares its own `QUESTION_BANKS` array (even when it lists every bank): it shows at a glance which banks the page renders. The server function takes `questionBank` as a string, checks it against that array and builds its own breadcrumbs.
- `createFileRoute` options order: `component`, one-line data (`validateSearch`, …), one-line functions, `loader`, `head`.
- Every page defines `head` through `buildPageHead` (`libs/ui/utils/build-page-head.ts`) with a title built from the loader data.
- Question page (`/questions/$question`, one route per bank): the server function returns only the question and the default breadcrumbs (bank from `shortTitle` > Questions (search) > id); the viewer logic lives in the page, with no hooks. Listing pages link with a `breadcrumbs` search param (their own crumbs, last one linked, plus the question id); the loader returns them when present and the page clears the param straight away (`staleTime: Infinity` stops the loader re-running). No in-viewer prev/next scope.
- Study sessions are the `kind` and `id` search params of `/question-banks/$questionBank/study-session` (listing pages just link there). `use-study-session.ts` keeps one session in localStorage (`chair-flight-study-session`, via `use-local-storage.ts`): the same id resumes after refresh, a different id silently replaces it. The admin question review reuses it with an `admin:` id.
- Tests live in localStorage (`chair-flight-test-history`, `use-tests.ts`): up to 10, oldest silently dropped. `/tests` lists them, `/tests/new` creates, `/tests/$test` shows the study, exam or review UI by `mode` and `status`. Abort deletes the test; "Close review" keeps it.
- `use-question-viewer.ts` (one question, state controlled upstream), `use-study-session.ts` and `use-test-session.ts` are independent: none imports another, and sessions are independent from tests.

## Scripts and temporary code

- Temporary code and tools go in `.workdir` (untracked).
- AI-written scripts go in `src/slop/<descriptive-name>`: one file per task, no abstraction into libs unless told, so cleaning up is deleting that file.
- Validate content with the compile command in [`content/CONTRIBUTING.md`](../content/CONTRIBUTING.md).
