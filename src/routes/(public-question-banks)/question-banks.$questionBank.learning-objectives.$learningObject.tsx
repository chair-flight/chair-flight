import {
  createFileRoute,
  createLink,
  notFound,
  redirect,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/mini";
import { formatQuestionPreviewAsMarkdown } from "../../libs/base/format-values";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Button } from "../../libs/ui/components/base/button";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionPreviewCard } from "../../libs/ui/components/elements/question-preview-card";
import { TitlePage } from "../../libs/ui/components/elements/title-page";
import { PlayIcon } from "../../libs/ui/icons/play-icon";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const QUESTION_BANKS = ["atpl_a", "ppl_a"] as const;

const ButtonLink = createLink(Button);

const getLearningObjectivePageData = createServerFn({ method: "GET" })
  .validator(z.object({ learningObject: z.string(), questionBank: z.string() }))
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as "atpl_a";
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();
    if (!data.learningObject.includes(".")) {
      throw redirect({
        to: "/question-banks/$questionBank/learning-objectives",
        params: { questionBank },
      });
    }

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const learningObjective = index.learningObjectivesMap.get(
      data.learningObject,
    );
    if (!learningObjective) throw notFound();

    const questions = index.questions
      .filter((question) =>
        question.learningObjectiveIds.some(
          (id) =>
            id === learningObjective.id ||
            id.startsWith(`${learningObjective.id}.`),
        ),
      )
      .map(({ id, previews, numberOfVariants }) => ({
        id,
        preview: formatQuestionPreviewAsMarkdown(previews[0]),
        numberOfVariants,
      }));

    const chapterPrefix = learningObjective.id.split(".").slice(0, 2).join(".");

    return {
      questionBank,
      questions,
      learningObjective,
      breadcrumbs: [
        {
          label: index.shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        {
          label: "Learning Objectives",
          link: {
            to: "/question-banks/$questionBank/learning-objectives" as const,
            params: { questionBank },
          },
        },
        ...(learningObjective.id === chapterPrefix
          ? []
          : [
              {
                label: chapterPrefix,
                link: {
                  to: "/question-banks/$questionBank/learning-objectives" as const,
                  params: { questionBank },
                  search: { q: `parent:${chapterPrefix}` },
                },
              },
            ]),
        { label: learningObjective.id, mono: true },
      ],
    };
  });

const LearningObjectiveQuestionsPage: FC = () => {
  const { questionBank, questions, learningObjective, breadcrumbs } =
    Route.useLoaderData();

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-8">
          <TitlePage
            size="medium"
            parent={{
              label: "Learning Objectives",
              back: true,
              link: {
                to: "/question-banks/$questionBank/learning-objectives",
                params: { questionBank },
              },
            }}
            caption={learningObjective.id}
            title={learningObjective.text}
            items={learningObjective.items}
          />
          {questions.length > 0 && (
            <ButtonLink
              to="/question-banks/$questionBank/study-session"
              params={{ questionBank }}
              search={{
                kind: "learning-objective",
                id: learningObjective.id,
              }}
              variant="primary"
              size="medium"
              className="self-start"
            >
              <PlayIcon size={16} />
              Study this learning objective
            </ButtonLink>
          )}
          {questions.length === 0 && (
            <p className="m-0 p-12 text-center text-sm text-muted">
              No questions available for this learning objective.
            </p>
          )}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {questions.map((question) => (
              <li key={question.id}>
                <QuestionPreviewCard
                  id={question.id}
                  preview={question.preview}
                  numberOfVariants={question.numberOfVariants}
                  link={{
                    to: "/question-banks/$questionBank/questions/$question",
                    params: { questionBank, question: question.id },
                    search: {
                      breadcrumbs: [
                        ...breadcrumbs.map((crumb, position) =>
                          position < breadcrumbs.length - 1
                            ? crumb
                            : {
                                ...crumb,
                                link: {
                                  to: "/question-banks/$questionBank/learning-objectives/$learningObject",
                                  params: {
                                    questionBank,
                                    learningObject: learningObjective.id,
                                  },
                                },
                              },
                        ),
                        { label: question.id, mono: true },
                      ],
                    },
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/learning-objectives/$learningObject",
)({
  component: LearningObjectiveQuestionsPage,
  loader: ({ params }) => getLearningObjectivePageData({ data: params }),
  head: ({ loaderData }) =>
    buildPageHead({
      title: `${loaderData?.learningObjective.id} · Chair Flight`,
      description: loaderData?.learningObjective.text,
    }),
});
