import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod/mini";
import { formatMillisecondsAsClock } from "../../libs/base/format-values";
import { Button } from "../../libs/ui/components/base/button";
import { Logo } from "../../libs/ui/components/base/logo";
import { Modal } from "../../libs/ui/components/base/modal";
import { Test } from "../../libs/ui/components/containers/test";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { QuestionMultipleChoice } from "../../libs/ui/components/elements/question-multiple-choice";
import { TestNotFound } from "../../libs/ui/components/tests/test-not-found";
import { TestReview } from "../../libs/ui/components/tests/test-review";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { cn } from "../../libs/ui/utils/cn";
import { useTestSession } from "../-hooks/use-test-session";
import type { ComponentProps, FC } from "react";
import type { Test as TestData } from "../../libs/core/tests/test";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;
const PARAMS_VALIDATOR = z.object({
  questionBank: z.enum(QUESTION_BANKS),
  test: z.string().check(z.minLength(1)),
});

type Session = ReturnType<typeof useTestSession>;

const useAnnexModal = () => {
  const modal = useDisclose();
  const [href, setHref] = useState("");

  return {
    modal,
    href,
    openAnnex: (nextHref: string) => {
      setHref(nextHref);
      modal.open();
    },
  };
};

const TestExam: FC<{ test: TestData; session: Session }> = ({
  test,
  session,
}) => {
  const navigate = useNavigate();
  const [progressOpen, setProgressOpen] = useState(false);
  const index = test.currentQuestionIndex;
  const question = test.questions[index];
  if (!question) return <TestNotFound />;

  return (
    <Test
      mode="exam"
      fullPage
      blocked={session.annexModal.open}
      onOptionKey={(optionIndex) => {
        const option = question.options[optionIndex];
        if (option) session.selectOption(option.id);
      }}
      title={test.title}
      index={index}
      total={test.questions.length}
      panel={progressOpen ? "progress" : undefined}
      remaining={formatMillisecondsAsClock(
        session.timeLeftInMs,
        test.durationInMs > 60 * 60 * 1000,
      )}
      warning={session.timeLeftInMs < 5 * 60 * 1000}
      expired={session.expired}
      unanswered={
        test.questions.filter((item) => !item.selectedOptionId).length
      }
      onPanelChange={(panel) => setProgressOpen(panel === "progress")}
      onNavigate={session.goToQuestion}
      onFinish={session.finishTest}
      onAbort={async () => {
        await navigate({
          to: "/question-banks/$questionBank/tests",
          params: { questionBank: test.questionBank },
        });
        session.abandonTest();
      }}
    >
      <Test.Question>
        <QuestionMultipleChoice {...session.question} />
      </Test.Question>
      <Test.Progress
        current={index}
        onSelect={session.goToQuestion}
        items={test.questions.map((item) => ({
          id: item.questionId,
          status: item.selectedOptionId ? "answered" : "unanswered",
        }))}
      />
      <Modal {...session.annexModal}>
        <QuestionAnnexViewer {...session.annexViewer} />
      </Modal>
    </Test>
  );
};

const TestStudy: FC<{ test: TestData; session: Session }> = ({
  test,
  session,
}) => {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<ComponentProps<typeof Test>["panel"]>();
  const index = test.currentQuestionIndex;
  const question = test.questions[index];
  if (!question) return <TestNotFound />;
  const answered = Boolean(question.selectedOptionId);

  return (
    <Test
      mode="study"
      fullPage
      blocked={session.annexModal.open}
      onOptionKey={(optionIndex) => {
        const option = question.options[optionIndex];
        if (option) session.selectOption(option.id);
      }}
      title={question.templateId}
      index={index}
      total={test.questions.length}
      panel={panel}
      canFinish={index === test.questions.length - 1 && answered}
      onPanelChange={setPanel}
      onNavigate={session.goToQuestion}
      onFinish={session.finishTest}
      onSeeReview={session.finishTest}
      onContinueLater={async () => {
        session.saveAndExit();
        await navigate({
          to: "/question-banks/$questionBank/tests",
          params: { questionBank: test.questionBank },
        });
      }}
    >
      <Test.Question>
        <QuestionMultipleChoice {...session.question} />
      </Test.Question>
      <Test.Information
        explanation={answered ? question.explanation : undefined}
        onAnnexClick={session.onAnnexClick}
      />
      <Test.Progress
        current={index}
        onSelect={session.goToQuestion}
        items={test.questions.map((item) => ({
          id: item.questionId,
          status: !item.selectedOptionId
            ? "unanswered"
            : item.selectedOptionId === item.correctOptionId
              ? "correct"
              : "wrong",
        }))}
      />
      <Modal {...session.annexModal}>
        <QuestionAnnexViewer {...session.annexViewer} />
      </Modal>
    </Test>
  );
};

const TestFinished: FC<{ test: TestData }> = ({ test }) => {
  const { modal, href, openAnnex } = useAnnexModal();

  return (
    <div className="flex h-dvh flex-col bg-canvas text-ink">
      <header
        className={cn(
          "flex h-10 flex-none items-center gap-4 border-b border-rule",
          "bg-paper px-4",
        )}
      >
        <Link to="/" className="flex items-center gap-2 text-ink no-underline">
          <Logo />
          <span
            className={cn(
              "text-sm font-bold tracking-widest whitespace-nowrap uppercase",
            )}
          >
            Chair Flight
          </span>
        </Link>
        <span className="flex-1" />
        <Link
          to="/question-banks/$questionBank/tests"
          params={{ questionBank: test.questionBank }}
        >
          <Button>Close review</Button>
        </Link>
      </header>
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        <TestReview test={test} onAnnexClick={openAnnex} />
      </div>
      <Modal open={modal.isOpen} onClose={modal.close}>
        <QuestionAnnexViewer href={href} onClose={modal.close} />
      </Modal>
    </div>
  );
};

const TestPage: FC = () => {
  const { test: testId } = PARAMS_VALIDATOR.parse(Route.useParams());
  const session = useTestSession(testId);
  const { test } = session;

  if (!test) return <TestNotFound />;
  if (test.status === "finished") return <TestFinished test={test} />;
  if (test.mode === "exam") return <TestExam test={test} session={session} />;
  return <TestStudy test={test} session={session} />;
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/tests/$test",
)({
  component: TestPage,
  ssr: false,
  loader: ({ params }) => {
    const parsedParams = PARAMS_VALIDATOR.safeParse(params);
    if (parsedParams.error) throw notFound();
  },
  head: () => ({ meta: [{ title: "Test · Chair Flight" }] }),
});
