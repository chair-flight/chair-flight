import { useEffect, useState } from "react";
import { parseAnnexHref } from "../../libs/core/question-templates/parse-annotated-annex-href";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { useTests } from "./use-tests";
import type { Test } from "../../libs/core/tests/test";

export const useTestSession = (testId: string) => {
  const { tests, saveTest, deleteTest } = useTests();
  const [sessionStartEpochMs, setSessionStartEpochMs] = useState(Date.now);
  const [nowEpochMs, setNowEpochMs] = useState(Date.now);
  const [annexHref, setAnnexHref] = useState("");
  const annexModal = useDisclose();
  const test = tests.find((item) => item.id === testId) ?? null;

  useEffect(() => {
    const interval = setInterval(() => setNowEpochMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeSpentInMs =
    (test?.timeSpentInMs ?? 0) + nowEpochMs - sessionStartEpochMs;
  const timeLeftInMs = (test?.durationInMs ?? 0) - timeSpentInMs;

  const updateTest = (changes: Partial<Test>) => {
    if (!test) return;
    const now = Date.now();
    saveTest({
      ...test,
      status: "started",
      startedAtEpochMs: test.startedAtEpochMs ?? now,
      timeSpentInMs,
      ...changes,
    });
    setSessionStartEpochMs(now);
    setNowEpochMs(now);
  };

  const goToQuestion = (index: number) => {
    if (!test) return;
    if (index < 0 || index >= test.questions.length) return;
    updateTest({ currentQuestionIndex: index });
  };

  const selectOption = (selectedOptionId: string) => {
    if (!test) return;
    const current = test.questions[test.currentQuestionIndex];
    if (test.mode === "study" && current?.selectedOptionId) return;
    updateTest({
      questions: test.questions.map((question, index) => {
        if (index !== test.currentQuestionIndex) return question;
        return { ...question, selectedOptionId };
      }),
    });
  };

  const openAnnex = (href: string) => {
    setAnnexHref(href);
    annexModal.open();
  };

  const current = test?.questions[test.currentQuestionIndex];
  const answered = Boolean(current?.selectedOptionId);
  const reveal = test?.mode === "study" && answered;

  const finishTest = () => {
    updateTest({ status: "finished", finishedAtEpochMs: Date.now() });
  };

  return {
    test,
    timeSpentInMs,
    timeLeftInMs,
    expired: test?.mode === "exam" && timeLeftInMs <= 0,
    question: {
      title: test?.mode === "study" ? current?.templateId : undefined,
      question: current?.question ?? "",
      options: current?.options ?? [],
      annexes: current?.annexes,
      selectedOptionId: current?.selectedOptionId,
      correctOptionId: reveal ? current?.correctOptionId : undefined,
      showResult: reveal,
      disabled: reveal,
      onOptionClick: selectOption,
      onAnnexClick: openAnnex,
    },
    onAnnexClick: openAnnex,
    annexModal: {
      open: annexModal.isOpen,
      onClose: annexModal.close,
    },
    annexViewer: {
      ...parseAnnexHref(annexHref),
      onClose: annexModal.close,
    },
    goToQuestion,
    selectOption,
    finishTest,
    saveAndExit: () => updateTest({}),
    abandonTest: () => deleteTest(testId),
  };
};
