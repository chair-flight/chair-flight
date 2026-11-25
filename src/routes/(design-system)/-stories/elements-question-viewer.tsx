import { useState } from "react";
import { QuestionMultipleChoice } from "../../../libs/ui/components/elements/question-multiple-choice";
import { QuestionViewer } from "../../../libs/ui/components/elements/question-viewer";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

export const ElementsQuestionViewer: FC = () => {
  const [tab, setTab] = useState<"question" | "explanation" | "variants">(
    "explanation",
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string>();
  const [shuffleCount, setShuffleCount] = useState(0);
  const [variant, setVariant] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);

  return (
    <StoryBlock title="Default">
      <div className="h-[560px] overflow-hidden rounded-lg border border-rule">
        <QuestionViewer
          tab={tab}
          onTabChange={setTab}
          shuffle={{
            count: shuffleCount,
            onShuffle: () => {
              setShuffleCount((previous) => previous + 1);
              setSelectedOptionId(undefined);
            },
          }}
          navigation={{
            currentQuestionIndex: questionIndex,
            totalQuestions: 12,
            onNavigation: (target) =>
              setQuestionIndex((previous) => {
                if (typeof target === "number") return target;
                return target === "next" ? previous + 1 : previous - 1;
              }),
          }}
          information={{
            explanation: "The cylinder is filled to **1850 psi**.",
            links: [{ label: "Chapter", text: "Oxygen", link: STORY_LINK }],
            variants: {
              items: [
                {
                  variant: 1,
                  question: "What is the maximum oxygen pressure?",
                },
                { variant: 2, question: "Oxygen psi?" },
              ],
              selectedVariant: variant,
              onVariantChange: setVariant,
            },
          }}
        >
          <QuestionMultipleChoice
            title="Q1"
            question="What is the flight crew maximum oxygen pressure?"
            options={[
              { id: "a", text: "1850 psi" },
              { id: "b", text: "1100 psi" },
              { id: "c", text: "3000 psi" },
              { id: "d", text: "1000 psi" },
            ]}
            correctOptionId="a"
            selectedOptionId={selectedOptionId}
            showResult={Boolean(selectedOptionId)}
            onOptionClick={setSelectedOptionId}
          />
        </QuestionViewer>
      </div>
    </StoryBlock>
  );
};
