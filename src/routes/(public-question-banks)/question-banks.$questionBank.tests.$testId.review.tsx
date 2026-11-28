import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getTestScore } from "../../libs/core/tests/get-test-score";
import { Modal } from "../../libs/ui/components/base/modal";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { QuestionViewer } from "../../libs/ui/components/elements/question-viewer";
import { TestReviewer } from "../../libs/ui/components/tests/test-reviewer";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { useTestAnnex } from "../-hooks/use-test-annex";
import { useTestRoute } from "../-hooks/use-test-route";
import { getTestsPageData } from "./question-banks.$questionBank.tests.index";
import type { ComponentProps, FC } from "react";
import type { Breadcrumb } from "../../libs/ui/components/base/breadcrumbs";

type ReviewNavigation = NonNullable<
  ComponentProps<typeof QuestionViewer>["navigation"]
>;

const noop = () => undefined;

const TestReviewPage: FC = () => {
  const { test } = useTestRoute();
  const { bankBreadcrumb } = Route.useLoaderData();
  const { annexModal, annexViewer, onAnnexClick } = useTestAnnex();
  const [questionIndex, setQuestionIndex] = useState<number>();
  const [tab, setTab] = useState<"question" | "explanation">("question");
  const current =
    questionIndex === undefined ? undefined : test.questions[questionIndex];

  const openQuestion = useCallback((index: number) => {
    setTab("question");
    setQuestionIndex(index);
  }, []);
  const closeQuestion = useCallback(() => setQuestionIndex(undefined), []);

  const onNavigation = useCallback<ReviewNavigation["onNavigation"]>(
    (target) => {
      const index =
        typeof target === "number"
          ? target
          : (questionIndex ?? 0) + (target === "previous" ? -1 : 1);
      if (index >= 0 && index < test.questions.length) setQuestionIndex(index);
    },
    [questionIndex, test.questions.length],
  );

  const navigation = useMemo<ReviewNavigation>(
    () => ({
      currentQuestionIndex: questionIndex ?? 0,
      totalQuestions: test.questions.length,
      statuses: test.questions.map((item) =>
        item.selectedOptionId === item.correctOptionId ? "correct" : "wrong",
      ),
      flags: test.questions.map((item) => item.flagged),
      onNavigation,
    }),
    [onNavigation, questionIndex, test.questions],
  );
  const result = useMemo(() => getTestScore(test), [test]);
  const goBack = useMemo(
    () => ({ label: "Back to test review", onClick: closeQuestion }),
    [closeQuestion],
  );
  const information = useMemo(
    () => ({ explanation: current?.explanation }),
    [current],
  );
  const question = useMemo(
    () => ({
      question: current?.question ?? "",
      title: current?.templateId,
      options: current?.options ?? [],
      annexes: current?.annexes,
      selectedOptionId: current?.selectedOptionId,
      correctOptionId: current?.correctOptionId,
      showResult: true,
      disabled: true,
      onOptionClick: noop,
      onAnnexClick,
    }),
    [current, onAnnexClick],
  );

  const breadcrumbs = useMemo<Breadcrumb[]>(
    () => [
      bankBreadcrumb,
      {
        label: "Tests",
        link: {
          to: "/question-banks/$questionBank/tests",
          params: { questionBank: test.questionBank },
        },
      },
      { label: test.id, mono: true },
    ],
    [bankBreadcrumb, test.id, test.questionBank],
  );

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main className="overflow-hidden">
        <div
          hidden={Boolean(current)}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <TestReviewer
            test={test}
            result={result}
            onAnnexClick={onAnnexClick}
            onOpenQuestion={openQuestion}
          />
        </div>
        {current ? (
          <QuestionViewer
            tab={tab}
            onTabChange={setTab}
            question={question}
            navigation={navigation}
            information={information}
            annexModal={annexModal}
            annexViewer={annexViewer}
            onAnnexClick={onAnnexClick}
            goBack={goBack}
          />
        ) : (
          <Modal {...annexModal}>
            <QuestionAnnexViewer {...annexViewer} />
          </Modal>
        )}
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/tests/$testId/review",
)({
  component: TestReviewPage,
  loader: ({ params }) =>
    getTestsPageData({
      data: { questionBank: questionBankNameSchema.parse(params.questionBank) },
    }),
  head: () => buildPageHead({ title: "Test review · Chair Flight" }),
});
