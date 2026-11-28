import { useCallback, useMemo, useState } from "react";
import { TestViewer } from "../../../libs/ui/components/tests/test-viewer";
import { STORY_TEST_FINISHED } from "../-mock-data/design-system-mock-data";
import { StoryBlock } from "./story-block";
import type { ComponentProps, FC } from "react";

const noop = () => undefined;
const ANNEX_MODAL = { open: false, onClose: noop };
const ANNEX_VIEWER = { href: "", onClose: noop };
const TIMER = { remaining: "42:10", warning: false, expired: false };

const Example: FC<{ mode: "study" | "exam" }> = ({ mode }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | undefined)[]>([]);
  const [flags, setFlags] = useState<boolean[]>([]);
  const questions = STORY_TEST_FINISHED.questions;
  const current = questions[index];

  const onNavigation = useCallback(
    (target: "previous" | "next" | number) => {
      setIndex((previous) => {
        const next =
          typeof target === "number"
            ? target
            : previous + (target === "previous" ? -1 : 1);
        return Math.min(Math.max(next, 0), questions.length - 1);
      });
    },
    [questions.length],
  );
  const selectOption = useCallback(
    (id: string) => {
      setAnswers((previous) =>
        questions.map((_, position) =>
          position === index ? id : previous[position],
        ),
      );
    },
    [index, questions],
  );
  const toggleFlag = useCallback(() => {
    setFlags((previous) =>
      questions.map((_, position) =>
        position === index ? !previous[position] : previous[position],
      ),
    );
  }, [index, questions]);
  const navigation = useMemo<ComponentProps<typeof TestViewer>["navigation"]>(
    () => ({
      currentQuestionIndex: index,
      items: questions.map((item, position) => ({
        id: item.questionId,
        flagged: flags[position],
        status: !answers[position]
          ? "unanswered"
          : mode === "exam"
            ? "answered"
            : answers[position] === item.correctOptionId
              ? "correct"
              : "wrong",
      })),
      onNavigation,
    }),
    [answers, flags, index, mode, onNavigation, questions],
  );
  const question = useMemo(
    () => ({
      ...current,
      selectedOptionId: answers[index],
      onOptionClick: selectOption,
    }),
    [answers, current, index, selectOption],
  );
  const information = useMemo(
    () => ({ explanation: current.explanation }),
    [current],
  );

  return (
    <div className="h-[640px] overflow-hidden rounded-lg border border-rule">
      <TestViewer
        mode={mode}
        title="Meteorology"
        question={question}
        information={information}
        navigation={navigation}
        annexModal={ANNEX_MODAL}
        annexViewer={ANNEX_VIEWER}
        timer={TIMER}
        onToggleFlag={toggleFlag}
        onFinish={noop}
      />
    </div>
  );
};

export const TestsTestViewer: FC = () => (
  <>
    <StoryBlock title="Study">
      <Example mode="study" />
    </StoryBlock>
    <StoryBlock title="Exam">
      <Example mode="exam" />
    </StoryBlock>
  </>
);
