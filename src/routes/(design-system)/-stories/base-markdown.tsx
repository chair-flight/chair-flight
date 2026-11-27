import { buildAnnotatedAnnexHref } from "../../../libs/core/question-templates/build-annotated-annex-href";
import { Markdown } from "../../../libs/ui/components/base/markdown";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const ANNOTATED_HREF = buildAnnotatedAnnexHref({
  href: "/content/annexes/atpl_a/APIJ.svg",
  width: 1285,
  height: 1540,
  annotations: [
    { type: "line", from: [200, 1200], to: [900, 400], dash: "14 9" },
    { type: "circle", x: 900, y: 400, r: 14, fill: "#0d33a6" },
  ],
});

const TEXT = `Plain text with **bold**, *italic*, **bold with *italic* inside**, \`inline code\` and a [link](https://example.com). Water is H<sub>2</sub>O and area is m<sup>2</sup>.

A second paragraph, to check the spacing between paragraphs.  
This line follows a hard line break.`;

const HEADINGS = `# Heading one

Text under heading one.

## Heading two

Text under heading two.

### Heading three

Text under heading three.

#### Heading four

Text under heading four.`;

const LISTS = `- First item
- Second item with **bold**
  - Nested item
  - Another nested item
- Third item

1. Step one
2. Step two with *italic*
3. Step three`;

const QUOTES = `> Check the quantity before the first flight of the day.

> **Quoted bold** next to normal quoted text, then a list:
>
> - First quoted item
> - Second quoted item with **bold**
>
> 1. First quoted step
> 2. Second quoted step

Text after the quote, with **bold outside** for comparison.`;

const TABLES = `| System | Pressure | Note       |
| ------ | -------- | ---------- |
| A      | 3000 psi | **Normal** |
| B      | 3000 psi | *Standby*  |`;

const MATHS = `Inline maths $$\\text{TAS} = M \\times a$$ in a sentence.

$$
\\text{TAS} = M \\times 38.967854 \\times \\sqrt{\\text{OAT} + 273.15}
$$

$$
\\text{Speed} & = \\frac{\\text{distance}}{\\text{time}} \\\\
& = \\frac{120}{0.5} \\\\
& = 240 \\text{ kt}
$$`;

const SEARCH =
  "Pressure is **pressure** again, inside `pressure` it stays plain.";

const IMAGES = `
![Annotated annex](${ANNOTATED_HREF})
![Plain image](/content/annexes/atpl_a/APIJ.svg)
`;

export const BaseMarkdown: FC = () => (
  <div className="flex max-w-2xl flex-col gap-8">
    <StoryBlock title="Text">
      <Markdown>{TEXT}</Markdown>
    </StoryBlock>
    <StoryBlock title="Headings">
      <Markdown>{HEADINGS}</Markdown>
    </StoryBlock>
    <StoryBlock title="Lists">
      <Markdown>{LISTS}</Markdown>
    </StoryBlock>
    <StoryBlock title="Quotes">
      <Markdown>{QUOTES}</Markdown>
    </StoryBlock>
    <StoryBlock title="Table">
      <Markdown>{TABLES}</Markdown>
    </StoryBlock>
    <StoryBlock title="Question table">
      <Markdown question>{TABLES}</Markdown>
    </StoryBlock>
    <StoryBlock title="Maths">
      <Markdown>{MATHS}</Markdown>
    </StoryBlock>
    <StoryBlock title="Search highlight">
      <Markdown highlight="pressure">{SEARCH}</Markdown>
    </StoryBlock>
    <StoryBlock title="Large text">
      <Markdown large>{TEXT}</Markdown>
    </StoryBlock>
    <StoryBlock title="Images">
      <Markdown renderAnnexes>{IMAGES}</Markdown>
    </StoryBlock>
  </div>
);
