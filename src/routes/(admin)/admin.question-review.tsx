import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { z } from "zod/mini";
import { QUESTION_BANK_NAMES } from "../../libs/core/content/question-bank-name";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Modal } from "../../libs/ui/components/base/modal";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { QuestionMultipleChoice } from "../../libs/ui/components/elements/question-multiple-choice";
import { QuestionViewer } from "../../libs/ui/components/elements/question-viewer";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { useStudySession } from "../-hooks/use-study-session";
import type { FC } from "react";

const getQuestionReviewData = createServerFn({ method: "GET" })
  .validator(z.object({ questionIds: z.array(z.string()) }))
  .handler(async ({ data }) => {
    if (!import.meta.env.DEV) throw notFound();
    const db = getQuestionBankDb();
    const indexes = await Promise.all(
      QUESTION_BANK_NAMES.map(async (questionBank) => {
        const index = await db.getQuestionBank(questionBank);
        return { questionBank, index };
      }),
    );
    const entries = data.questionIds.map((questionId) => {
      const match = indexes.find(({ index }) =>
        index.questionsMap.has(questionId),
      );
      return { questionId, match };
    });
    const found = entries.flatMap(({ questionId, match }) => {
      if (!match) return [];
      const question = match.index.questionsMap.get(questionId);
      if (!question) return [];
      return {
        question,
        id: question.id,
        annexes: match.index.annexes.filter((annex) =>
          getQuestionAnnexIds(question).includes(annex.id),
        ),
        details: [
          `**Bank:** ${match.questionBank}`,
          `**Chapter:** ${question.chapterId}`,
          `**Learning objectives:** ${question.learningObjectiveIds.join(", ") || "none"}`,
        ].join("  \n"),
      };
    });
    return {
      questions: found,
      missing: entries
        .filter(({ match }) => !match)
        .map(({ questionId }) => questionId),
    };
  });

const AdminQuestionReviewPage: FC = () => {
  const { questions, missing } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const bankQuestions = useMemo(
    () => questions.map((item) => item.question),
    [questions],
  );
  const annexes = useMemo(
    () => questions.flatMap((item) => item.annexes),
    [questions],
  );

  const session = useStudySession({
    id: `admin:${search.questions ?? ""}`,
    questions: bankQuestions,
    annexes,
    tab: search.tab ?? "question",
    onTabChange: (tab) =>
      navigate({
        to: ".",
        search: (previous) => ({
          ...previous,
          tab: tab === "question" ? undefined : tab,
        }),
        replace: true,
      }),
  });
  const details = questions[session.questionIndex]?.details ?? "";

  return (
    <Public>
      <Public.Header
        showThemeToggle
        breadcrumbs={[{ label: "Admin" }, { label: "Question review" }]}
      />
      <Public.Main className="overflow-y-hidden!">
        {questions.length === 0 ? (
          <p className="m-0 p-12 text-center text-sm text-muted">
            No questions to review. Pass ?questions=QABCD,QEFGH.
            {missing.length > 0 && ` Not found: ${missing.join(", ")}.`}
          </p>
        ) : (
          <>
            <QuestionViewer
              {...session.viewer}
              information={{
                ...session.viewer.information,
                notes: [
                  { title: "Details", content: details },
                  ...(missing.length > 0
                    ? [{ title: "Not found", content: missing.join(", ") }]
                    : []),
                ],
              }}
            >
              <QuestionMultipleChoice {...session.question} />
            </QuestionViewer>
            <Modal {...session.annexModal}>
              <QuestionAnnexViewer {...session.annexViewer} />
            </Modal>
          </>
        )}
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute("/(admin)/admin/question-review")({
  component: AdminQuestionReviewPage,
  validateSearch: z.object({
    tab: z.catch(z.optional(z.enum(["explanation", "variants"])), undefined),
    questions: z.catch(z.optional(z.string()), undefined),
  }),
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  loaderDeps: ({ search }) => ({ questions: search.questions }),
  loader: ({ deps }) => {
    const questionIds = (deps.questions ?? "")
      .split(",")
      .map((questionId) => questionId.trim())
      .filter(Boolean);
    return getQuestionReviewData({ data: { questionIds } });
  },
  head: () =>
    buildPageHead({
      title: "Question review · Chair Flight",
      path: "/admin/question-review",
    }),
});
