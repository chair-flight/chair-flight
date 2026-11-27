import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useMemo } from "react";
import { z } from "zod/mini";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getLearningObjectiveFamily } from "../../libs/core/question-bank/get-learning-objective-family";
import { getLearningObjectiveQuestionCounts } from "../../libs/core/question-bank/get-learning-objective-question-counts";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { LearningObjectivesTable } from "../../libs/ui/components/elements/learning-objectives-table";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { ContentHeading } from "./-content-heading";
import type { FC } from "react";

const contentLayoutRoute = getRouteApi(
  "/(public-question-banks)/question-banks/$questionBank/content/$contentId",
);

const paramsSchema = z.object({
  questionBank: questionBankNameSchema,
  contentId: z.string(),
});

const getContentLearningObjectives = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank, contentId } = data;
    const index = await getQuestionBankDb().getQuestionBank(questionBank);
    const questionCounts = getLearningObjectiveQuestionCounts(
      index,
      index.learningObjectives,
    );
    const items = getLearningObjectiveFamily(index, contentId).map(
      ({ id, parentId, level, text, items, source, courses }) => ({
        id,
        parentId,
        level,
        text,
        items,
        source,
        courses,
        numberOfQuestions: questionCounts[id] ?? null,
      }),
    );
    return { items, courses: index.courses, shortTitle: index.shortTitle };
  });

type ParamsType = z.infer<typeof paramsSchema>;

const ContentLearningObjectivesPage: FC = () => {
  const { questionBank, contentId } = Route.useParams();
  const { label } = contentLayoutRoute.useLoaderData();
  const { items: objectives, courses } = Route.useLoaderData();

  const items = useMemo(
    () =>
      objectives.map((item) => ({
        ...item,
        link: {
          to: "/question-banks/$questionBank/content/$contentId" as const,
          params: { questionBank, contentId: item.id },
        },
      })),
    [objectives, questionBank],
  );

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-480 flex-1 flex-col gap-2 p-2 sm:gap-3 sm:p-6">
      <ContentHeading
        title={label}
        contentId={contentId}
        subtitle="Learning Objectives"
      />
      <div className="min-h-0 flex-1">
        <LearningObjectivesTable items={items} courses={courses} />
      </div>
    </div>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/content/$contentId/learning-objectives",
)({
  component: ContentLearningObjectivesPage,
  loader: ({ params }) =>
    getContentLearningObjectives({ data: params as ParamsType }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `Learning objectives · ${params.contentId} · ${loaderData?.shortTitle}`,
    }),
});
