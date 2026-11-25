import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useEffect, useRef, useState } from "react";
import { z } from "zod/mini";
import { getLearningObjectiveQuestionCounts } from "../../libs/core/question-bank/get-learning-objective-question-counts";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Input } from "../../libs/ui/components/base/input";
import { SearchHighlightContext } from "../../libs/ui/components/base/search-highlight-context";
import { Public } from "../../libs/ui/components/containers/public";
import { LearningObjectivesTable } from "../../libs/ui/components/elements/learning-objectives-table";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const QUESTION_BANKS = ["atpl_a", "ppl_a"] as const;

const getLearningObjectivesPageData = createServerFn({ method: "GET" })
  .validator(z.object({ questionBank: z.string() }))
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as "atpl_a";
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const { learningObjectives } = index;
    const questionCounts = getLearningObjectiveQuestionCounts(
      index,
      learningObjectives,
    );
    const items = learningObjectives
      .map(({ subject, ...item }) => ({
        ...item,
        numberOfQuestions: questionCounts[item.id] ?? null,
      }))
      .toSorted((a, b) => a.id.localeCompare(b.id));
    const { shortTitle, title, description } = index;

    return {
      questionBank,
      title,
      description,
      items,
      courses: index.courses,
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
        <div className="flex h-full flex-col">
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
            <SearchHighlightContext
              value={q.replace(/parent:\S+/gi, "").trim()}
            >
              <LearningObjectivesTable
                items={items}
                query={q}
                courses={courses}
                questionsLink={(learningObjectiveId) =>
                  learningObjectiveId.includes(".")
                    ? {
                        to: "/question-banks/$questionBank/learning-objectives/$learningObject",
                        params: {
                          questionBank,
                          learningObject: learningObjectiveId,
                        },
                      }
                    : undefined
                }
              />
            </SearchHighlightContext>
          </div>
        </div>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/learning-objectives/",
)({
  component: LearningObjectivesPage,
  validateSearch: z.object({ q: z.optional(z.string()) }),
  loader: ({ params }) => getLearningObjectivesPageData({ data: params }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `Learning objectives · ${loaderData?.title}`,
      description: loaderData?.description,
      path: `/question-banks/${params.questionBank}/learning-objectives`,
    }),
});
