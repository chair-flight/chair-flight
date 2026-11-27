import { QuestionBankPreviewCard } from "../../../libs/ui/components/elements/question-bank-preview-card";
import { AirplaneAirbus320 } from "../../../libs/ui/components/outlines/airplane-airbus-320";
import { AirplaneBoeing737 } from "../../../libs/ui/components/outlines/airplane-boeing-737";
import { AirplaneCessna172 } from "../../../libs/ui/components/outlines/airplane-cessna-172";
import { AirplaneTecnamP2006t } from "../../../libs/ui/components/outlines/airplane-tecnam-p2006t";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

export const ElementsQuestionBankPreviewCard: FC = () => (
  <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
    <StoryBlock title="Outline bottom right">
      <div className="flex flex-col gap-4">
        <QuestionBankPreviewCard
          kind="ATPL (A)"
          title="ECQB 2026"
          Outline={AirplaneTecnamP2006t}
          outlinePosition="bottom-right"
          numberOfQuestions={2437}
          link={STORY_LINK}
        />
        <QuestionBankPreviewCard
          kind="PPL (A)"
          title="ECQB 2020"
          Outline={AirplaneCessna172}
          outlinePosition="bottom-right"
          numberOfQuestions={1204}
          link={STORY_LINK}
        />
      </div>
    </StoryBlock>
    <StoryBlock title="Outline bottom">
      <div className="flex flex-col gap-4">
        <QuestionBankPreviewCard
          kind="Type rating"
          title="A320"
          Outline={AirplaneAirbus320}
          outlinePosition="bottom"
          numberOfQuestions={845}
          link={STORY_LINK}
        />
        <QuestionBankPreviewCard
          kind="Type rating"
          title="737"
          Outline={AirplaneBoeing737}
          outlinePosition="bottom"
          numberOfQuestions={612}
          link={STORY_LINK}
        />
      </div>
    </StoryBlock>
  </div>
);
