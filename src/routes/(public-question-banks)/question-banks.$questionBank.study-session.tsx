import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/mini";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { getQuestionsInScope } from "../../libs/core/question-bank/get-questions-in-scope";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Modal } from "../../libs/ui/components/base/modal";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { QuestionMultipleChoice } from "../../libs/ui/components/elements/question-multiple-choice";
import { QuestionViewer } from "../../libs/ui/components/elements/question-viewer";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { useStudySession } from "../-hooks/use-study-session";
import type { FC } from "react";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;

const getStudySessionPageData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      questionBank: z.string(),
      kind: z.enum(["chapter", "subject", "learning-objective"]),
      id: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as (typeof QUESTION_BANKS)[number];
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const typeRating = questionBank === "a320" || questionBank === "b737";
    const bank = {
      label: index.shortTitle,
      link: {
        to: "/question-banks/$questionBank" as const,
        params: { questionBank },
      },
    };
    const { kind, id } = data;

    const exists =
      kind === "learning-objective"
        ? index.learningObjectivesMap.has(id)
        : kind === "subject"
          ? index.subjectsMap.has(id)
          : index.chaptersMap.has(id);
    if (!exists) throw notFound();

    const scopedQuestions = getQuestionsInScope(index, id);
    const annexIds = scopedQuestions.flatMap(getQuestionAnnexIds);
    const annexes = index.annexes.filter((annex) =>
      annexIds.includes(annex.id),
    );
    const learningObjectives = scopedQuestions
      .flatMap((question) => question.learningObjectiveIds)
      .map((learningId) => ({
        id: learningId,
        text: index.learningObjectivesMap.get(learningId)?.text ?? "",
      }));

    const scopeBreadcrumbs =
      kind === "chapter"
        ? [
            {
              label: "Chapters",
              link: {
                to: "/question-banks/$questionBank/chapters" as const,
                params: { questionBank },
              },
            },
            {
              label: typeRating ? `Chapter ${Number(id)}` : id,
              link: {
                to: "/question-banks/$questionBank/chapters/$chapter" as const,
                params: { questionBank, chapter: id },
              },
            },
          ]
        : kind === "subject"
          ? [
              {
                label: "Subjects",
                link: {
                  to: "/question-banks/$questionBank/subjects" as const,
                  params: { questionBank },
                },
              },
              {
                label: id,
                link: {
                  to: "/question-banks/$questionBank/subjects/$subject" as const,
                  params: { questionBank, subject: id },
                },
              },
            ]
          : [
              {
                label: "Learning objectives",
                link: {
                  to: "/question-banks/$questionBank/learning-objectives" as const,
                  params: { questionBank },
                },
              },
              {
                label: id,
                link: {
                  to: "/question-banks/$questionBank/learning-objectives/$learningObject" as const,
                  params: { questionBank, learningObject: id },
                },
              },
            ];

    return {
      questionBank,
      shortTitle: index.shortTitle,
      questions: scopedQuestions,
      annexes,
      learningObjectives,
      breadcrumbs: [bank, ...scopeBreadcrumbs, { label: "Study session" }],
    };
  });

const StudySessionPage: FC = () => {
  const { questionBank, questions, annexes, learningObjectives, breadcrumbs } =
    Route.useLoaderData();
  const { kind, id, tab } = Route.useSearch();
  const navigate = useNavigate();
  const easa = questionBank === "atpl_a" || questionBank === "ppl_a";

  const session = useStudySession({
    id: `${questionBank}:${kind}:${id}`,
    questions,
    annexes,
    tab: tab ?? "question",
    onTabChange: (nextTab) =>
      navigate({
        to: ".",
        search: (previous) => ({
          ...previous,
          tab: nextTab === "question" ? undefined : nextTab,
        }),
        replace: true,
      }),
  });

  const current = questions[session.questionIndex];
  const scopeLinks = breadcrumbs.slice(-2, -1).flatMap((item) => {
    if (!("link" in item)) return [];
    return [{ label: item.label, link: item.link }];
  });
  const learningObjectiveLinks = easa
    ? (current?.learningObjectiveIds ?? []).map((learningId) => ({
        label: learningId,
        text:
          learningObjectives.find((item) => item.id === learningId)?.text ?? "",
        link: {
          to: "/question-banks/$questionBank/learning-objectives/$learningObject" as const,
          params: { questionBank, learningObject: learningId },
        },
      }))
    : [];

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main className="overflow-y-hidden!">
        <QuestionViewer
          {...session.viewer}
          information={{
            ...session.viewer.information,
            links: [...scopeLinks, ...learningObjectiveLinks],
          }}
        >
          <QuestionMultipleChoice {...session.question} />
        </QuestionViewer>
        <Modal {...session.annexModal}>
          <QuestionAnnexViewer {...session.annexViewer} />
        </Modal>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/study-session",
)({
  component: StudySessionPage,
  validateSearch: z.object({
    kind: z.enum(["chapter", "subject", "learning-objective"]),
    id: z.string(),
    tab: z.catch(z.optional(z.enum(["explanation", "variants"])), undefined),
  }),
  loaderDeps: ({ search }) => ({ kind: search.kind, id: search.id }),
  loader: ({ params, deps }) =>
    getStudySessionPageData({
      data: { questionBank: params.questionBank, ...deps },
    }),
  head: ({ loaderData }) =>
    buildPageHead({ title: `Study session · ${loaderData?.shortTitle}` }),
});
