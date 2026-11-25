import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { z } from "zod/mini";
import { getChapterSelection } from "../../libs/core/question-bank/get-chapter-selection";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Public } from "../../libs/ui/components/containers/public";
import { ChapterSelection } from "../../libs/ui/components/elements/chapter-selection";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const QUESTION_BANKS = ["ppl_a"] as const;

const getQuestionBankSubjectsPageData = createServerFn({ method: "GET" })
  .validator(z.object({ questionBank: z.string() }))
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as "ppl_a";
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const learningObjectives = index.learningObjectives;
    const { shortTitle, title, description } = index;
    return {
      questionBank,
      title,
      description,
      subjects: getChapterSelection(questionBank, index, learningObjectives),
      breadcrumbs: [
        {
          label: shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank: questionBank },
          },
        },
        { label: "Subjects" },
      ],
    };
  });

const QuestionBankRawSubjectsPage: FC = () => {
  const { questionBank, subjects, breadcrumbs } = Route.useLoaderData();

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <section className="flex min-h-full shrink-0 flex-col justify-center">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:gap-8 md:p-8">
            <ChapterSelection
              chapters={subjects}
              getLink={(subjectId) => ({
                to: "/question-banks/$questionBank/subjects/$subject",
                params: { questionBank, subject: subjectId },
              })}
            />
          </div>
        </section>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/subjects/",
)({
  component: QuestionBankRawSubjectsPage,
  loader: ({ params }) => getQuestionBankSubjectsPageData({ data: params }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `${loaderData?.title} · Chair Flight`,
      description: loaderData?.description,
      path: `/question-banks/${params.questionBank}/subjects`,
    }),
});
