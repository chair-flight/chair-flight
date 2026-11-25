import { useState } from "react";
import { Test } from "../../../libs/ui/components/containers/test";
import { QuestionMultipleChoice } from "../../../libs/ui/components/elements/question-multiple-choice";
import { StoryBlock } from "./story-block";
import type { ComponentProps, FC } from "react";

const Example: FC<{ mode: "study" | "exam" }> = ({ mode }) => {
  const [panel, setPanel] = useState<ComponentProps<typeof Test>["panel"]>();
  const [selectedOptionId, setSelectedOptionId] = useState<string>();

  return (
    <div className="h-[640px] overflow-hidden rounded-lg border border-rule">
      <Test
        mode={mode}
        title="Oxygen"
        index={0}
        total={12}
        panel={panel}
        remaining="42:10"
        unanswered={11}
        onOptionKey={() => undefined}
        onPanelChange={setPanel}
        onNavigate={() => undefined}
        onFinish={() => undefined}
        onContinueLater={() => undefined}
        onSeeReview={() => undefined}
        onAbort={() => undefined}
      >
        <Test.Question>
          <QuestionMultipleChoice
            question="What is the flight crew maximum oxygen pressure?"
            options={[
              { id: "a", text: "1850 psi" },
              { id: "b", text: "1100 psi" },
              { id: "c", text: "3000 psi" },
              { id: "d", text: "1000 psi" },
            ]}
            selectedOptionId={selectedOptionId}
            onOptionClick={setSelectedOptionId}
          />
        </Test.Question>
        <Test.Information explanation="The cylinder is charged to 1850 psi." />
        <Test.Progress
          current={0}
          onSelect={() => undefined}
          items={Array.from({ length: 12 }, (_, index) => ({
            id: String(index),
            status: index === 0 && selectedOptionId ? "answered" : "unanswered",
          }))}
        />
      </Test>
    </div>
  );
};

export const ContainersTest: FC = () => (
  <>
    <StoryBlock title="Study">
      <Example mode="study" />
    </StoryBlock>
    <StoryBlock title="Exam">
      <Example mode="exam" />
    </StoryBlock>
  </>
);
