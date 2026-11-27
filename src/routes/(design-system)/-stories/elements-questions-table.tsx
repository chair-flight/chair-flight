import { QuestionsTable } from "../../../libs/ui/components/elements/questions-table";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const ITEMS = [
  {
    id: "ABC-0001",
    question: "What is the standard sea level **pressure**?",
    answer: "1013.25 hPa",
    numberOfVariants: 2,
  },
  {
    id: "ABC-0002",
    question: "Which layer of the atmosphere contains most of the weather?",
    answer: "The troposphere",
    numberOfVariants: 1,
  },
  {
    id: "ABC-0003",
    question: "What happens to temperature with height in the troposphere?",
    answer: "It decreases",
    numberOfVariants: 3,
  },
];

export const ElementsQuestionsTable: FC = () => (
  <div className="flex flex-col gap-8">
    <StoryBlock title="Default">
      <div className="h-96">
        <QuestionsTable items={ITEMS} />
      </div>
    </StoryBlock>
    <StoryBlock title="Highlight, filter and answers">
      <div className="h-96">
        <QuestionsTable
          items={ITEMS}
          highlight="pressure temperature"
          filterItems={["ABC-0001", "ABC-0003"]}
          showAnswers
        />
      </div>
    </StoryBlock>
    <StoryBlock title="Loading">
      <div className="h-96">
        <QuestionsTable items={[]} loading />
      </div>
    </StoryBlock>
  </div>
);
