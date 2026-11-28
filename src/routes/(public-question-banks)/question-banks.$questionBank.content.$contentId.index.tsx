import { createFileRoute, createLink } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useCallback } from "react";
import { z } from "zod/mini";
import { countUnique } from "../../libs/base/arrays";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { getQuestionsInScope } from "../../libs/core/question-bank/get-questions-in-scope";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Button } from "../../libs/ui/components/base/button";
import { ButtonStat } from "../../libs/ui/components/base/button-stat";
import { PlayIcon } from "../../libs/ui/components/icons/play-icon";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { ContentHeading } from "./-content-heading";
import { ContentStudyDialog } from "./-content-study-dialog";
import type { FC } from "react";

const ButtonStatLink = createLink(ButtonStat);

const paramsSchema = z.object({
  questionBank: questionBankNameSchema,
  contentId: z.string(),
});

const getContentHomePageData = createServerFn({ method: "GET" })
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank, contentId } = data;
    const index = await getQuestionBankDb().getQuestionBank(questionBank);
    const objective = index.learningObjectivesMap.get(contentId);
    const questions = getQuestionsInScope(index, contentId);
    const questionCount = questions.length;
    const variantCount = questions.reduce(
      (count, question) => count + question.numberOfVariants,
      0,
    );
    const learningObjectiveCount = countUnique(
      questions.flatMap((question) => question.learningObjectiveIds),
    );
    const questionsLink = {
      to: "/question-banks/$questionBank/content/$contentId/questions",
      params: data,
    } as const;

    const heroStats = [
      {
        label: "Questions",
        value: questionCount,
        detail: `${variantCount} variants`,
        link: questionsLink,
      },
      ...(learningObjectiveCount > 0
        ? [
            {
              label: "Learning objectives",
              value: learningObjectiveCount,
              link: {
                to: "/question-banks/$questionBank/content/$contentId/learning-objectives" as const,
                params: data,
              },
            },
          ]
        : []),
      {
        label: "With figures",
        value: questions.filter((question) =>
          question.tags.includes("has-annex"),
        ).length,
        link: { ...questionsLink, search: { q: "tags:has-annex" } },
      },
      {
        label: "With explanations",
        value: questions.filter((question) =>
          question.tags.includes("has-explanation"),
        ).length,
        link: { ...questionsLink, search: { q: "tags:has-explanation" } },
      },
    ];

    return {
      questionBank,
      contentId,
      title:
        index.subjectsMap.get(contentId)?.shortName ??
        index.chaptersMap.get(contentId)?.title ??
        contentId,
      shortTitle: index.shortTitle,
      learningObjective: objective && {
        text: objective.text,
        items: objective.items,
      },
      questionCount,
      heroStats,
    };
  });

const getContentStudyQuestions = createServerFn({ method: "GET" })
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank, contentId } = data;
    const index = await getQuestionBankDb().getQuestionBank(questionBank);
    const questions = getQuestionsInScope(index, contentId);
    const annexIds = questions.flatMap(getQuestionAnnexIds);
    const annexes = index.annexes.filter((annex) =>
      annexIds.includes(annex.id),
    );
    return { questions, annexes };
  });

const ContentHomePage: FC = () => {
  const {
    questionBank,
    contentId,
    title,
    learningObjective,
    questionCount,
    heroStats,
  } = Route.useLoaderData();
  const study = useDisclose();
  const loadStudyQuestions = useCallback(
    () => getContentStudyQuestions({ data: { questionBank, contentId } }),
    [questionBank, contentId],
  );

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-480 flex-1 flex-col gap-6 overflow-y-auto p-2 sm:p-6">
      <header className="flex flex-col gap-2">
        <ContentHeading
          title={contentId}
          contentId={contentId}
          subtitle={title !== contentId ? title : undefined}
        />
        {learningObjective && (
          <div className="leading-6 wrap-break-word">
            <p className="m-0 whitespace-pre-line">{learningObjective.text}</p>
            {learningObjective.items.length > 0 && (
              <ul className="mt-3 mb-0 list-disc pl-6">
                {learningObjective.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {heroStats.map((stat) => (
          <ButtonStatLink
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
            {...stat.link}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-accent/40 bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 text-base font-bold">Study this content</h2>
          <p className="m-0 text-sm text-muted">
            Unlimited time. Answers show as soon as you respond.
          </p>
        </div>
        <Button
          variant="primary"
          size="medium"
          disabled={questionCount === 0}
          onClick={study.open}
        >
          <PlayIcon size={16} />
          Start study test
        </Button>
      </div>
      {study.isOpen && (
        <ContentStudyDialog
          questionBank={questionBank}
          contentId={contentId}
          questionCount={questionCount}
          loadQuestions={loadStudyQuestions}
          onClose={study.close}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/content/$contentId/",
)({
  component: ContentHomePage,
  remountDeps: ({ params }) => params,
  loader: ({ params }) =>
    getContentHomePageData({
      data: paramsSchema.parse(params),
    }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `${params.contentId} · ${loaderData?.shortTitle}`,
    }),
});
