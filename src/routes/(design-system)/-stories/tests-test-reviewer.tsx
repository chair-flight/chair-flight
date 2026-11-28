import { getTestScore } from "../../../libs/core/tests/get-test-score";
import { TestReviewer } from "../../../libs/ui/components/tests/test-reviewer";
import { STORY_TEST_FINISHED } from "../-mock-data/design-system-mock-data";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const CHAPTERS = [
  { id: "050.01", text: "The atmosphere" },
  { id: "050.02", text: "Wind" },
];

const QUESTION_LEARNING_OBJECTIVES = Object.fromEntries(
  STORY_TEST_FINISHED.questions.map((question, index) => [
    question.templateId,
    [index < 4 ? "050.01.01" : "050.02.01"],
  ]),
);

const TEST = {
  ...STORY_TEST_FINISHED,
  questions: STORY_TEST_FINISHED.questions.map((question, index) => ({
    ...question,
    flagged: index === 2 || index === 4,
  })),
};
const RESULT = getTestScore(TEST);

export const TestsTestReviewer: FC = () => (
  <StoryBlock title="Finished test">
    <div className="overflow-hidden rounded-lg border border-rule">
      <TestReviewer
        test={TEST}
        result={RESULT}
        onOpenQuestion={() => undefined}
        chapters={CHAPTERS}
        questionLearningObjectives={QUESTION_LEARNING_OBJECTIVES}
      />
    </div>
  </StoryBlock>
);
