# Contributing content

Read this before writing, merging or explaining any question in `content/question-bank-*`, then the bank's own `CONTRIBUTING.md` (sources, subject guidelines, progress, questions needing review). 
Architecture and the content pipeline are in [`AGENTS.md`](../AGENTS.md); 
code rules in [`src/CONTRIBUTING.md`](../src/CONTRIBUTING.md).


## General

- British English. Gender-neutral: never "he/she"; use "they" or rewrite.
- Graphics: no labels; title, subtitle only for critical info; no explainer text unless asked.
- Markdown tables are aligned in source.
- YAML in `content/` is the source of truth; `metadata.yaml` ids (`subjects[].id`, chapter ids) are quoted strings, and question `subjectId` and `chapterId` must match them.
- A320 and B737 are one course (`TYPE_RATING`) and officially single-subject: `metadata.yaml` has exactly one subject (id = the bank name) whose chapters are the systems. Chapter ids are `<bank>.NN` (`b737.01`, `a320.01`, like ATPL's `010.01`), in `metadata.yaml` and in every question's `chapterId`. Question files are `<subject>.<chapter>.yaml` (`a320.01.yaml`) and every question carries that `subjectId` and `chapterId`. The UI presents the two differently.
- Ids: `Q` + 4 random uppercase letters; annexes `A` + 3 letters. Check uniqueness across all banks.

## Vocabulary

| Term     | Meaning                                                                                                          |
|----------|------------------------------------------------------------------------------------------------------------------|
| Question | One body of knowledge (a fact, a rule, a calculation method). Has an id, a chapter and learning objectives.     |
| Template | One way of asking that knowledge: a stem, an explanation and its answers. A question has one or more templates. |
| Variant  | What a student sees: a template with one preset (or one subset of options) applied. Shown as `?variant=N`.      |
| Preset   | A set of `variables`, correct answers and wrong answers for a `simple` template. Same stem, different values.   |

The first template of a question is the most comprehensive; order the others by priority. A student can land on any of them, so every template must be answerable from the same explanation.

## One question, one body of knowledge

- Group under one question everything that tests the same knowledge, for example a multiple-correct template plus one `simple` template per correct fact.
- Different facts from the same source are separate questions. Link them with `relatedQuestionIds` (two-way).
- Calculations: group stems that share the solution logic. Small changes (different numbers, a different unknown of the same formula) are presets or templates of one question.
- Definitions: group terms only when easily confused (one term's definition is plausible for another).
- "Name X in the image": when a figure has several labelled points, cover every point with a variant.
- Variants of one question never contradict each other. Read every template's correct answer and distractors side by side: a distractor true in another template of the same question must not be wrong here.
- Never keep two templates with the same stem or the same answers.

## Template types

| Type               | Use for                                                                                   |
|--------------------|-------------------------------------------------------------------------------------------|
| `simple`           | Everything else. One stem, correct answers and wrong answers, optionally several presets. |
| `definition`       | Term-and-meaning pairs (reversible/irreversible, Air-ground/Air-to-ground).               |
| `one-two`          | Pairs of statements where the student marks which are right and which are wrong.          |
| `multiple-correct` | Pick every correct option from a list; `variants[].show` lists which options appear.      |
| `true-or-false`    | Independent statements answered true or false.                                            |

- `simple` accepts several correct answers and more than three wrong answers. Near-identical stems become one `simple` template with the union of correct answers and the non-overlapping wrong answers.
- `definition`: `{term}` is substituted into the stem, so put the article in the term when needed (`an irreversible`, `A reversible`). Plausible distractors go in `fakeOptions`. The same pair under different stems are separate templates of one question. `{table}` in the explanation is replaced by the generated term table.
- Annexes in a stem or explanation: `![alt](annex:ID)`, optionally sized `annex:ID:sm` (default), `:md` or `:lg` (full width). In a `definition` template make the annex the term: `term: ANLK` on each option and `![alt](annex:{{term}})` (or `annex:{{term}}:md`) in the stem; `{table}` then shows each image next to its meaning. Never add an `annex` field to an option.
- A question lists every annex it uses in `annexes`, shared by all its templates. An entry is `{ id: APIJ }` (plain) or an annotated annex with all of `id`, `base`, `width`, `height` and `annotations` (`{ id: buffet1, base: APIJ, width, height, annotations: [...] }`: `id` is a local name, `base` the real annex). An annotated annex exists only for that question and is used by its `id`: `![alt](annex:buffet1:lg)`. Referencing `annex:APIJ` directly still needs its own plain entry, even when an annotated entry has it as `base`. Annexes live in `metadata.yaml`.
- A wrong answer in a `simple` preset may carry a `mistake` (the reasoning that leads to it).

## Stems and answers

- Gaps are six underscores, no numbers: `______`. For several gaps write `______` for each and let the options carry the order: `The ______ is measured from the ______.`
- A question that refers to an annex says so in its first line, then a blank line and the question: `Refer to Figure.` (figure in the question's annexes), `Refer to Annex X.` (numbered annex) or `Refer to CAP XXX.` (document name and table, for a published chart or table).
- Sentence answers end with one dot. Labels, noun phrases, numbers with units and fill-in-the-blank pairs need none.
- A number always has its unit (`520 kt`, `4 000 ft`), and every answer in a question uses the same unit and format.
- No two correct answers with the same phrasing. No "all of the above" or "none of the above".
- Wrong answers are plausible, similar in length and form to the correct one, and wrong for a reason a student could make (swapped label, wrong constant, missed step), never absurd.
- Do not put the answer in the stem or the explanation title.
- Stems taking numbered statements ("1, 2 and 3 are correct") use `multiple-correct` or `one-two`, not a `simple` template with numbered combinations.
- Every question has at least one learning objective, in its own chapter. Never carry one from another chapter; move the question if the chapter is wrong (FRMS is 040.03.06.05.09, not 010).

## Calculation questions

One `simple` template whose stem and explanation use variables, with one preset per set of values.

- Put values in the stem as `{{name}}` and define them under `variables` in every preset. Never hard-code a value that changes between presets.
- Every number the explanation shows is a variable: inputs, intermediate results (kelvin temperature, speed of sound, height to climb), the final `answer` and the distractors (`d1`, `d2`…). Name them for what they are, not `macro1`.
- Compute each preset and check it: the correct answer equals the calculated result and each distractor matches the mistake the explanation says it comes from.
- At least two presets with clearly different values, so the answer cannot be memorised.
- Distractors come from real mistakes: wrong unit, sign or constant, a skipped step, the wrong formula.

```yaml
- type: simple
  question: |-
    An aircraft is flying at the following conditions:

    - Mach number: {{mach}}
    - OAT: {{oat}} °C

    What is the TAS?
  explanation: |-
    …
  presets:
    - variables:
        mach: 0.915
        oat: -60.5
        kelvin: 212.65
        answer: 520
        d1: 605
      correctAnswers:
        - text: 520 kt
      wrongAnswers:
        - text: 605 kt
```

## Tags

- Every question has `tags` in its YAML (a lowercase kebab-case list). It is optional and defaults to `[]`; manual tags are for now left empty.
- The compiler adds two tags automatically: `has-annex` (the question lists an annex) and `has-explanation` (at least one template has a non-empty explanation). Never write these by hand.
- The app's question search filters by tag with `tags:<name>` (for example `tags:has-annex`). Several `tags:` filters must all match.

## Explanations

Every template needs an `explanation`. A question without one carries `explanation: ""` (required by the schema); never delete the line.

### Format

- Always `explanation: |-` (literal), never `>` or `>-` (folded style puts a blank line after every source line). No wrapped tables.
- Markdown reads the same in the YAML and parsed. One paragraph is one line, never hard-wrapped (no 80-column wrapping, no line breaks copied from PDFs). A blank line only between paragraphs. Headings, list items and table rows each on their own line. No trailing spaces, no double blank lines.
- Sentences end with a dot.

### Content

- Law-based subjects: open with a quote of the applicable law, then explain only if the link to the answer is not obvious.
- Heading `### Source, Article` (e.g. `### ICAO Doc 8168, Volume I, Part II, Section 5, Chapter 7, 7.1.7`), then a `>` blockquote, then a short comment.
- Quote verbatim and mark cuts as `[…]`. Bold the part of a long quote that decides the answer (a value, condition or key term) and only that, not whole sentences: a quote of more than a sentence or two with nothing in bold is incomplete. One `>` line per quoted paragraph; a line holding only `>` between paragraphs, never a blank line (it ends the blockquote).
- Quote only when the exact wording is what is tested and the text really says the answer; otherwise explain in prose. No quote for plain facts. Never present a quote as saying more than it does (the Basic Regulation never says "hard law" or "soft law"; those are EASA's terms).
- Where no law covers it (IATA, trade bodies), say so; do not force a quote.
- For confusable terms (Air-ground vs Air-to-ground), quote both definitions and add one aligned table stating the difference, key word in bold.
- Grouped questions: summarise all facts. Templates of one question share most of the explanation and differ only by highlights, clarifications, or adapted formulas and values.
- Never write doubt ("unverified", "not in the sources", "probably"). If no source in `.external` or the learning objective backs a fact, leave the question unexplained and list it in the bank's TODO.
- Memory aids and informal explanations only when a human asks.

### Maths

- `$$ … $$` blocks: LaTeX, no macros, no MathML. If the converter lacks a command, extend `libs/ui/utils/convert-latex-as-mathml.ts`.
- Numbers come from preset `variables` via `{{name}}`, never hard-coded. A brace-led variable inside LaTeX braces needs spaces: `\frac{ {{a}} }{ {{b}} }`.
- Structure: one or two sentences of intro (the principle, the constant), then the steps, then `## Why the other answers are wrong`. No bold labels between steps and no one-giant-formula explanations.
- Steps are one aligned `$$` block: one step per line, `\\` between lines, `&=` as the alignment point, no `\begin{aligned}` (any block with `&` or `\\` is aligned by default). Each line: symbolic formula, substituted values with units, result with units.
- Units on every number in a substitution (`\frac{ {{height}}\ \text{ft} }{ {{roc}}\ \text{ft/min} }`). Words and units go in `\text{}`, multi-letter names as `\text{LSS}`, subscripts for variants (`T_{\text{Kelvin}}`).
- Final answer `\mathbf{ {{answer}}\ \text{unit} }`; `\approx` when rounded.
- Wrong-answer list: `- **{{d1}} unit**: reason`, no stray spaces inside the bold.
- Reference questions for the layout are in the bank's `CONTRIBUTING.md`.

## Merging and importing (ATPL_A, PPL_A)

- Helicopter content is out of scope: rewrite for aeroplanes, or delete if an aeroplane equivalent exists.
- Same fact, different stems → one question, one template per stem (answering one would give away the other). Same stem, different correct answers → presets within one template.
- Append merged templates after the survivor's so existing `?variant=N` links stay valid. Union `externalQuestionIds`, `learningObjectiveIds` and `annexes`; remove the merged id from every `relatedQuestionIds`.
- Inside a question file, sort questions by their first learning objective, and each question's learning objectives.

## Sources

- Download documents to `.external/` at the repository root (next to `content/` and `src/`, not inside `content/`; untracked), laid out as below. Each bank's `CONTRIBUTING.md` lists its sources.
- Before declaring a source missing, a question unsourceable or leaving it unexplained, list `.external/data/*` and grep every extraction there (ICAO annexes and docs, EASA Easy Access Rules including SERA and Doc 4444 text), never an old note about what exists: notes go stale.
- `.workdir/knowledge.md` records every fact or source text looked up, so it is not fetched twice.

### `.external` layout

Lives at the repository root (`<repo>/.external`). It has two folders; nothing sits directly in it.

- `originals/<issuer>/<document>[-<version>].<ext>`: files exactly as collected (downloaded, or user-provided such as FCOMs, QRHs and AFMs). Never edit them. One folder per issuer (`easa`, `icao`, `eu`, `un`, `uk-caa`, `boeing`, `tecnam`, …).
- `data/<issuer>/<document>[-<version>].<ext>`: anything derived from an original (text extractions, cleaned HTML, tables), same issuer folder and document name.
- Names: lowercase kebab-case, no hashes, dates or download ids. Easy Access Rules: `easy-access-rules-<subject>-<regulation>`.
- Before downloading, check both folders. Delete failed downloads, duplicates and anything not used by a question, tool or note; keep no scratch files.
- Tools read from `.external/originals`; the LO importer expects `easa/tk-syllabus-comparison-v{2..6}.xlsx`.

## Question review page

- `/admin/question-review?questions=QAAAA,QBBBB` (dev server only; 404 in production) shows any bank's questions in the order given, with unknown ids under "Not found".
- Whenever the user asks to see questions (an import, rewrite, merge, "show me X"), give a link to it with the relevant ids, e.g. `http://localhost:3100/admin/question-review?questions=...`. Don't paste question text into chat or build another viewer.

## Before you finish

1. Compile:

```bash
node -e "import('./src/tools/compile-question-banks.ts').then(m=>m.compileQuestionBanks()).then(()=>console.log('compiled OK'))"
```

   A zod error path `[n, templates, m, field]` is question n, template m in that file.
2. Open the questions on the review page and read them as a student would.
3. Record the sources you used in `.workdir/knowledge.md`.

Editing YAML with the `yaml` library: `doc.toString({ blockQuote: "literal", lineWidth: 0 })` keeps `|-` explanations; `get("explanation")` already returns the string; empty files parse to `contents === null`.
