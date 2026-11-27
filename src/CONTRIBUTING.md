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

## React state

- Never create compound state variables: no `useState` holding an object that bundles unrelated fields (`{ questionId, variants, seeds, answers }`). One `useState` per concern; per-item data is an array or keyed by index.
- Every callback defined in a hook or component is wrapped in `useCallback` (and derived objects passed down in `useMemo`).

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

- Use 8 px (`p-2`, `gap-2`) as the default for mobile layout gutters and spacing around content such as tables.
- UI components may know business logic: prefer `type="wallet"` over passing column lists or flags. Never import DB/core types for it.
- New UI component → add a design-system story unless told otherwise.
- Search highlighting: no context. `base/highlight.tsx` (`Highlight`, `highlight` is a string or a word array) holds all the logic; `Markdown` takes the same `highlight` prop. `LearningObjectivesTable` and `QuestionsTable` take `items` (optional `link` per item), `highlight`, `filterItems` (ids; `undefined` renders all) and `loading`; filtering logic lives in core (`filter-learning-objective-ids.ts`, `search-questions.ts`).
- Modals and dialogs: fixed size regardless of content or loading; fixed-height body, overflow scrolls inside.
- Use `createLink` (at page level, not in the component library) instead of the `Link` component, unless it is a text link.
- Markdown: body 400 in 80% ink, 13px (questions 14px); bold 800 in full ink (in quotes: 70% of the way from muted to ink); headings 700. Bold must stay distinct in dark mode.
- Maths in explanations is rendered by `libs/ui/utils/convert-latex-as-mathml.ts`; extend it when a LaTeX command is missing instead of falling back to MathML. Aligned `$$` blocks (any block with `&` or `\\`) are an HTML grid of `<math>` cells (Chrome ignores `columnalign` and `text-align` on `mtd`; grid/flex on MathML elements breaks it): left column right-aligned, right column left-aligned, baseline aligned.

## Zod

- Use `{ z } from "zod/mini"` everywhere (routes, components, `libs/core/content` raw schemas, the compiler). Never import from `"zod"`. It is functional: `z.optional(z.string())`, `z.nullable(...)`, `z.catch(schema, undefined)`, `z._default(schema, [])`, `z.pipe(schema, z.transform(fn))`, `z.array(schema).parse(…)`, `z.string().check(z.regex(…))`, `z.minLength(1)`, `z.int()`. No chained methods (`.optional()`, `.default()`, `.array()`, `.nullable()`, `.transform()`). Type schemas with `satisfies z.ZodMiniType<T>`.
- Keep route files free of imports only the server or design system need: one pulls it into the entry chunk (check with `vite build --sourcemap`).

## Routes and pages

- Every page under `question-banks` defines `paramsSchema` (`z.object` of its route params, `questionBank: questionBankNameSchema`, plus any other param). The server function's `.validator(paramsSchema)` uses it, and the page declares `type ParamsType = z.infer<typeof paramsSchema>;`, and the loader passes `data: params as ParamsType`. No per-page `QUESTION_BANKS` arrays.
- `createFileRoute` options order: `component`, one-line data (`validateSearch`, …), one-line functions, `loader`, `head`.
- Every page defines `head` through `buildPageHead` (`libs/ui/utils/build-page-head.ts`) with a title built from the loader data.
- Question page (`/questions/$question`, one route per bank): the server function returns only the question and the default breadcrumbs (bank from `shortTitle` > Questions (search) > id); the viewer logic lives in the page, with no hooks. Listing pages link with a `breadcrumbs` search param (their own crumbs, last one linked, plus the question id); the loader returns them when present and the page clears the param straight away (`staleTime: Infinity` stops the loader re-running). No in-viewer prev/next scope.
- Subject, chapter and learning-objective pages share the layout at `/question-banks/$questionBank/content/$contentId`. The layout loader supplies navigation, breadcrumbs and page metadata. It resolves the id in order: subject, chapter, then learning objective (no match → 404). ATPL subject ids return 404. Home is the index route (`.index.tsx`). Questions and Learning Objectives are sibling routes at `/questions` and `/learning-objectives`, each with its own loader. The Questions route accepts an initial `q` search filter. Desktop navigation uses `Public.SidebarNav` (hidden in viewer mode) and mobile uses `Public.HamburgerMenu`. Home and Questions open the shared study dialog with local state. It creates and saves the test on the client (up to 200 questions, unlimited time).
- Content list: `/question-banks/$questionBank/content` (one route, `content.index`) shows subjects for `ppl_a` and chapters for the other banks, with nested chapters under subjects for `atpl_a`. Learning objectives are the leaf route `/learning-objectives`.
- Content home: the four stat boxes (questions with variants, learning objectives, questions with figures, questions with explanation) are links built by the Home loader, which calculates the counts from questions in scope. Figures and explanation boxes link to the Questions route with `tags:has-annex` or `tags:has-explanation` in the search box. The sidebar's first entry is the subject short name, the chapter title when it is 28 characters or fewer, or else the content id.
- Answers in the question table are censored (a solid bar over the answer text, not the ✅). The question count and actions appear in the inline toolbar on desktop and in a three-dot dropdown beside Filter Questions on mobile. On mobile, each question stacks the ID and variant count above the question text. The actions are practice questions, create quick test, show answers.
- The question list viewer's keys: `r` shuffles to a random variant, `v` moves to the next variant and shuffles, `i` toggles explanation, `1`–`4` pick an option, `up`/`down` move focus across options, `enter` selects the focused option, `left`/`right` change question, `n` opens question navigation. Keys are active only while the viewer is open.
- The question viewer owns the tab (`question` | `explanation`) and session state in React. The first Up or Down key press on an unanswered question reveals the answer focus indicator. The indicator persists across refreshes and returns to the first option when navigating to another question. Up and Down are enabled while the question is unanswered. Its `viewer` return value is spread straight into `QuestionViewer` (tab, question, annex modal and viewer, shuffle, navigation, information); pages add only `goBack`, `linkToQuestion` and `information.links`/`relatedQuestions`/`notes`. `QuestionViewer` has no children or slots. The admin question review uses the same hook.
- Tests live in localStorage (`chair-flight-test-history`, `use-tests.ts`): up to 10, oldest silently dropped. `/tests` lists them, `/tests/new` creates, `/tests/$test` shows the study, exam or review UI by `mode` and `status`. Abort deletes the test; "Close review" keeps it.
- `use-question-viewer.ts` (one question, variant and seed controlled upstream), `use-questions-viewer.ts` (a list of questions, state in React only) and `use-test-session.ts` are independent: none imports another, and they are independent from tests.

## Scripts and temporary code

- Temporary code and tools go in `.workdir` (untracked).
- AI-written scripts go in `src/slop/<descriptive-name>`: one file per task, no abstraction into libs unless told, so cleaning up is deleting that file.
- Validate content with the compile command in [`content/CONTRIBUTING.md`](../content/CONTRIBUTING.md).
