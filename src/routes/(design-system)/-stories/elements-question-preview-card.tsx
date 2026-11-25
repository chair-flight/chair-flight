import { QuestionPreviewCard } from "../../../libs/ui/components/elements/question-preview-card";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

export const ElementsQuestionPreviewCard: FC = () => (
  <div className="flex max-w-3xl flex-col gap-6">
    <StoryBlock title="Default">
      <div className="flex flex-col gap-2">
        <QuestionPreviewCard
          id="QCJDM"
          preview="What does the ground-air visual signal V mean?"
          numberOfVariants={16}
          link={STORY_LINK}
        />
        <QuestionPreviewCard
          id="QHHSA"
          preview="According to ICAO Annex 12, what does Rescue Coordination Centre mean?"
          numberOfVariants={1}
          link={STORY_LINK}
        />
      </div>
    </StoryBlock>
  </div>
);
