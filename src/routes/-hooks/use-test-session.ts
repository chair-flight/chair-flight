import { useCallback, useRef, useSyncExternalStore } from "react";
import { getExamDeadline } from "../../libs/core/tests/get-exam-deadline";
import type { Test } from "../../libs/core/tests/test";

export const useTestSession = (test: Test, saveTest: (test: Test) => void) => {
  const studyStartedAt = useRef(Date.now());
  const examDeadline = test.mode === "exam" ? getExamDeadline(test) : undefined;
  const activeDeadline = test.status === "finished" ? undefined : examDeadline;
  const { durationInMs } = test;
  const getSecondsRemaining = useCallback(() => {
    if (activeDeadline === undefined) return 0;
    const remaining = Math.min(durationInMs, activeDeadline - Date.now());
    return Math.max(0, Math.ceil(remaining / 1000));
  }, [activeDeadline, durationInMs]);

  const subscribeToCountdown = useCallback(
    (notify: () => void) => {
      if (activeDeadline === undefined) return () => undefined;
      const timeout: { id?: number } = {};
      const scheduleNextSecond = () => {
        window.clearTimeout(timeout.id);
        const remaining = activeDeadline - Date.now();
        if (remaining > 0) {
          timeout.id = window.setTimeout(refresh, remaining % 1000 || 1000);
        }
      };
      const refresh = () => {
        scheduleNextSecond();
        notify();
      };
      scheduleNextSecond();
      window.addEventListener("focus", refresh);
      window.addEventListener("pageshow", refresh);
      document.addEventListener("visibilitychange", refresh);
      return () => {
        window.clearTimeout(timeout.id);
        window.removeEventListener("focus", refresh);
        window.removeEventListener("pageshow", refresh);
        document.removeEventListener("visibilitychange", refresh);
      };
    },
    [activeDeadline],
  );
  const secondsRemaining = useSyncExternalStore(
    subscribeToCountdown,
    getSecondsRemaining,
  );

  const updateTest = useCallback(
    (
      changes: Pick<
        Partial<Test>,
        "questions" | "currentQuestionIndex" | "status"
      >,
    ) => {
      if (test.status === "finished") return;
      const now = Date.now();
      const finishing = changes.status === "finished";
      if (examDeadline !== undefined && now >= examDeadline && !finishing)
        return;

      const startedAtEpochMs =
        test.startedAtEpochMs ??
        (examDeadline === undefined
          ? studyStartedAt.current
          : test.createdAtEpochMs);
      const finishedAtEpochMs =
        examDeadline === undefined ? now : Math.min(now, examDeadline);
      const timeSpentInMs =
        examDeadline === undefined
          ? test.timeSpentInMs + Math.max(0, now - studyStartedAt.current)
          : Math.max(0, finishedAtEpochMs - startedAtEpochMs);

      saveTest({
        ...test,
        ...changes,
        status: finishing ? "finished" : "started",
        startedAtEpochMs,
        finishedAtEpochMs: finishing ? finishedAtEpochMs : null,
        timeSpentInMs,
      });
      studyStartedAt.current = now;
    },
    [examDeadline, saveTest, test],
  );

  const goToQuestion = useCallback(
    (target: "previous" | "next" | number) => {
      const index =
        typeof target === "number"
          ? target
          : test.currentQuestionIndex + (target === "previous" ? -1 : 1);
      if (index === test.currentQuestionIndex) return;
      if (index < 0 || index >= test.questions.length) return;
      updateTest({ currentQuestionIndex: index });
    },
    [test, updateTest],
  );

  const selectOption = useCallback(
    (selectedOptionId: string) => {
      const current = test.questions[test.currentQuestionIndex];
      if (!current?.options.some(({ id }) => id === selectedOptionId)) return;
      if (test.mode === "study" && current.selectedOptionId) return;
      updateTest({
        questions: test.questions.map((question, index) => {
          if (index !== test.currentQuestionIndex) return question;
          return { ...question, selectedOptionId };
        }),
      });
    },
    [test, updateTest],
  );

  const toggleFlag = useCallback(() => {
    updateTest({
      questions: test.questions.map((question, index) => {
        if (index !== test.currentQuestionIndex) return question;
        return { ...question, flagged: !question.flagged };
      }),
    });
  }, [test, updateTest]);

  const finishTest = useCallback(() => {
    updateTest({ status: "finished" });
  }, [updateTest]);

  return {
    secondsRemaining,
    goToQuestion,
    selectOption,
    toggleFlag,
    finishTest,
  };
};
