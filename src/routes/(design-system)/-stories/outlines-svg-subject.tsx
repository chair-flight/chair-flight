import { ATPL_SUBJECT_OUTLINES } from "../../../libs/ui/components/outlines/atpl-subject-outlines";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const OutlinesSvgSubject: FC = () => (
  <div className="grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
    {Array.from(ATPL_SUBJECT_OUTLINES, ([subjectId, { name, Icon }]) => (
      <StoryBlock key={subjectId} title={`${subjectId} · ${name}`}>
        <Icon className="mx-auto size-24 text-accent sm:size-32" />
      </StoryBlock>
    ))}
  </div>
);
