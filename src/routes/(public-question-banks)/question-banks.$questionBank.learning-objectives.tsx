import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod/mini";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getLearningObjectiveQuestionCounts } from "../../libs/core/question-bank/get-learning-objective-question-counts";
import { filterLearningObjectiveIds } from "../../libs/core/search/filter-learning-objective-ids";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Input } from "../../libs/ui/components/base/input";
import { Public } from "../../libs/ui/components/containers/public";
import { LearningObjectivesTable } from "../../libs/ui/components/elements/learning-objectives-table";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const paramsSchema = z.object({
  questionBank: questionBankNameSchema,
});

type ParamsType = z.infer<typeof paramsSchema>;

const getLearningObjectivesPageData = createServerFn({ method: "GET" })
  .validator(paramsSchema)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }) => {
    const { questionBank } = data;
    if (["atp_a", "ppl_a"].includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const qb = await db.getQuestionBank(questionBank);
    const { learningObjectives } = qb;
    const questionCounts = getLearningObjectiveQuestionCounts(
      qb,
      learningObjectives,
    );
    const items = learningObjectives
      .map(({ subject, ...item }) => ({
        ...item,
        numberOfQuestions: questionCounts[item.id] ?? null,
      }))
      .toSorted((a, b) => a.id.localeCompare(b.id));
    const { shortTitle, title, description } = qb;

    return {
      questionBank,
      title,
      description,
      items,
      courses: qb.courses,
      breadcrumbs: [
        {
          label: shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        { label: "Learning Objectives" },
      ],
    };
  });

const LearningObjectivesPage: FC = () => {
  const navigate = Route.useNavigate();
  const { q = "" } = Route.useSearch();
  const { questionBank, items, courses, breadcrumbs } = Route.useLoaderData();
  const [draft, setDraft] = useState(q);
  const requestedSearch = useRef(q);

  const linkedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        link: {
          to: "/question-banks/$questionBank/content/$contentId" as const,
          params: { questionBank, contentId: item.id },
        },
      })),
    [items, questionBank],
  );
  const filteredItems = useMemo(
    () => filterLearningObjectiveIds(items, q),
    [items, q],
  );

  useEffect(() => {
    if (q === requestedSearch.current) return;
    requestedSearch.current = q;
    setDraft(q);
  }, [q]);

  useEffect(() => {
    if (draft === q) return;
    const timeout = setTimeout(() => {
      requestedSearch.current = draft;
      navigate({
        replace: true,
        search: { q: draft === "" ? undefined : draft },
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [draft, q, navigate]);

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main className="overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-480 flex-col">
          <div className="flex-none p-3">
            <Input
              label="Search"
              hideLabel
              type="search"
              placeholder="Search Learning Objectives..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          <div className="min-h-0 flex-1 px-3 pb-3">
            <LearningObjectivesTable
              items={linkedItems}
              filterItems={filteredItems}
              highlight={q.replace(/parent:\S+/gi, "").trim()}
              courses={courses}
            />
          </div>
        </div>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/learning-objectives",
)({
  component: LearningObjectivesPage,
  validateSearch: z.object({ q: z.optional(z.string()) }),
  loader: ({ params }) =>
    getLearningObjectivesPageData({ data: params as ParamsType }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `Learning objectives · ${loaderData?.title}`,
      description: loaderData?.description,
      path: `/question-banks/${params.questionBank}/learning-objectives`,
    }),
});
