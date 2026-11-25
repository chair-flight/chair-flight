import { buildAnnotatedAnnexHref } from "../../../libs/core/question-templates/build-annotated-annex-href";
import { MarkdownImage } from "../../../libs/ui/components/base/markdown-image";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const PLAIN_HREF = "/content/annexes/atpl_a/APIJ.svg";

const ANNOTATED_HREF = buildAnnotatedAnnexHref({
  href: PLAIN_HREF,
  width: 1285,
  height: 1540,
  annotations: [
    {
      type: "line",
      from: [200, 1200],
      to: [900, 400],
      dash: "14 9",
      arrow: true,
    },
    { type: "circle", x: 900, y: 400, r: 14, fill: "#0d33a6" },
    { type: "text", x: 300, y: 300, text: "FL 380", size: 48 },
    {
      type: "rect",
      x: 150,
      y: 150,
      width: 400,
      height: 200,
      stroke: "#d11a1a",
      strokeWidth: 4,
    },
  ],
});

export const BaseMarkdownImage: FC = () => (
  <>
    <StoryBlock title="Small">
      <MarkdownImage href={PLAIN_HREF} size="sm" />
    </StoryBlock>
    <StoryBlock title="Medium">
      <MarkdownImage href={PLAIN_HREF} size="md" />
    </StoryBlock>
    <StoryBlock title="Large">
      <MarkdownImage href={PLAIN_HREF} size="lg" />
    </StoryBlock>
    <StoryBlock title="Annotated">
      <div className="flex flex-wrap items-start gap-4">
        <MarkdownImage href={ANNOTATED_HREF} size="sm" />
        <MarkdownImage href={ANNOTATED_HREF} size="md" />
      </div>
    </StoryBlock>
    <StoryBlock title="Clickable">
      <MarkdownImage href={PLAIN_HREF} size="sm" onClick={() => {}} />
    </StoryBlock>
    <StoryBlock title="Missing">
      <div className="flex flex-wrap items-start gap-4">
        <MarkdownImage size="sm" />
        <MarkdownImage size="md" />
      </div>
    </StoryBlock>
  </>
);
