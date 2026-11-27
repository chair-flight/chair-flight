import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { useEffect, useState } from "react";
import { z } from "zod/mini";
import { formatQuestionPreviewAsMarkdown } from "../../libs/base/format-values";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { searchLearningObjectives } from "../../libs/core/search/search-learning-objectives";
import { searchQuestionVariants } from "../../libs/core/search/search-question-variants";
import { searchQuestions } from "../../libs/core/search/search-questions";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Highlight } from "../../libs/ui/components/base/highlight";
import { Public } from "../../libs/ui/components/containers/public";
import { Search } from "../../libs/ui/components/elements/search";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

const paramsSchema = z.object({ questionBank: questionBankNameSchema });

const getSearchPageData = createServerFn({ method: "GET" })
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank } = data;

    const index = await getQuestionBankDb().getQuestionBank(questionBank);
    const { shortTitle } = index;

    return {
      shortTitle,
      breadcrumbs: [
        {
          label: shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        { label: "Search" },
      ],
    };
  });

const searchEasaBank = createServerFn({ method: "GET" })
  .validator(
    z.object({
      questionBank: z.enum(["atpl_a", "ppl_a"]),
      query: z.string().check(z.trim(), z.minLength(1), z.maxLength(200)),
    }),
  )
  .handler(async ({ data }) => {
    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(data.questionBank);
    const { learningObjectives } = index;
    const searchable = index.questions.map((q) => ({
      ...q,
      preview: formatQuestionPreviewAsMarkdown(q.previews[0]),
    }));
    const { items: questions } = searchQuestions({
      allQuestions: searchable,
      candidates: searchable,
      query: data.query,
      limit: 10,
    });
    const { words, items: matchingLearningObjectives } =
      searchLearningObjectives({
        learningObjectives,
        query: data.query,
      });
    setResponseHeader("Cache-Control", "public, max-age=7200");
    return {
      words,
      learningObjectives: matchingLearningObjectives,
      questions: questions.map((question) => ({
        id: question.id,
        preview: question.preview,
        learningObjectives: question.learningObjectiveIds,
        numberOfVariants: question.numberOfVariants,
      })),
    };
  });

const searchTypeRatingBank = createServerFn({ method: "GET" })
  .validator(
    z.object({
      questionBank: z.enum(["a320", "b737"]),
      query: z.string().check(z.trim(), z.minLength(1), z.maxLength(200)),
    }),
  )
  .handler(async ({ data }) => {
    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(data.questionBank);
    const { chapters } = index;
    const documents = index.questions.map((question) => ({
      id: question.id,
      chapterId: question.chapterId,
      chapterTitle:
        chapters.find((chapter) => chapter.id === question.chapterId)?.title ??
        "",
      templates: question.templates,
    }));
    const { words, items } = searchQuestionVariants({
      documents,
      query: data.query,
      limit: 10,
    });
    const matchingChapters = words.length
      ? chapters
          .filter((chapter) =>
            words.every((word) => chapter.title.toLowerCase().includes(word)),
          )
          .slice(0, 5)
          .map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            numberOfQuestions: index.questions.filter(
              (question) => question.chapterId === chapter.id,
            ).length,
          }))
      : [];
    setResponseHeader("Cache-Control", "public, max-age=7200");
    return { words, chapters: matchingChapters, questions: items };
  });

type EasaResults = Awaited<ReturnType<typeof searchEasaBank>>;

const EasaSearchPage: FC<{
  questionBank: "atpl_a" | "ppl_a";
}> = ({ questionBank }) => {
  const { shortTitle, breadcrumbs } = Route.useLoaderData();
  const { query: initialQuery = "" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<EasaResults>();
  const [searching, setSearching] = useState(false);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setResults(undefined);
      navigate({ search: { query: undefined }, replace: true });
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timeout = setTimeout(() => {
      navigate({ search: { query: trimmed }, replace: true });
      searchEasaBank({ data: { questionBank, query: trimmed } })
        .then((found) => !cancelled && setResults(found))
        .finally(() => !cancelled && setSearching(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed, navigate, questionBank]);

  const empty =
    results &&
    results.questions.length === 0 &&
    results.learningObjectives.length === 0;

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <Search active={Boolean(trimmed)}>
          <Search.Lead>
            <div
              className={cn(
                "flex flex-col items-center justify-center px-8 pt-8 pb-2",
                "text-center",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold tracking-widest text-muted uppercase",
                )}
              >
                Chair Flight
              </span>
              <h1
                className={cn(
                  "m-0 bg-linear-to-b from-ink to-accent bg-clip-text",
                  "text-5xl leading-tight font-bold tracking-tight",
                  "text-transparent lg:text-6xl",
                )}
              >
                {shortTitle}
              </h1>
            </div>
          </Search.Lead>
          <Search.Bar
            value={query}
            placeholder="Search learning objectives and questions..."
            onChange={setQuery}
          />
          {empty && !searching && (
            <Search.Empty>Nothing found for “{trimmed}”.</Search.Empty>
          )}
          {results && !empty && (
            <Search.Results>
              {results.learningObjectives.length > 0 && (
                <Search.Group title="Learning objectives">
                  {results.learningObjectives.map((item) => (
                    <Search.Item
                      key={item.id}
                      link={{
                        to: "/question-banks/$questionBank/learning-objectives",
                        params: { questionBank },
                        search: { q: item.id },
                      }}
                      className="items-baseline gap-3"
                    >
                      <span className="font-mono font-semibold text-accent">
                        {item.id}
                      </span>
                      <span className="font-semibold">
                        <Highlight highlight={results.words}>
                          {item.text}
                        </Highlight>
                      </span>
                    </Search.Item>
                  ))}
                </Search.Group>
              )}
              {results.questions.length > 0 && (
                <Search.Group title="Questions">
                  {results.questions.map((question) => (
                    <Search.Item
                      key={question.id}
                      link={{
                        to: "/question-banks/$questionBank/questions/$question",
                        params: { questionBank, question: question.id },
                      }}
                      className="flex-col gap-2"
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-accent">
                          {question.id}
                        </span>
                        <span className="text-muted">
                          {question.learningObjectives.join(" · ")}
                        </span>
                      </span>
                      <span className="line-clamp-3 font-medium">
                        <Highlight highlight={results.words}>
                          {question.preview.split("\n")[0] ?? ""}
                        </Highlight>
                      </span>
                    </Search.Item>
                  ))}
                </Search.Group>
              )}
            </Search.Results>
          )}
        </Search>
      </Public.Main>
    </Public>
  );
};

type TypeRatingResults = Awaited<ReturnType<typeof searchTypeRatingBank>>;

const TypeRatingSearchPage: FC<{
  questionBank: "a320" | "b737";
}> = ({ questionBank }) => {
  const { shortTitle, breadcrumbs } = Route.useLoaderData();
  const { query: initialQuery = "" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<TypeRatingResults>();
  const [searching, setSearching] = useState(false);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) {
      setResults(undefined);
      navigate({ search: { query: undefined }, replace: true });
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timeout = setTimeout(() => {
      navigate({ search: { query: trimmed }, replace: true });
      searchTypeRatingBank({ data: { questionBank, query: trimmed } })
        .then((found) => !cancelled && setResults(found))
        .finally(() => !cancelled && setSearching(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [trimmed, navigate, questionBank]);

  const empty =
    results && results.questions.length === 0 && results.chapters.length === 0;

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <Search active={Boolean(trimmed)}>
          <Search.Lead>
            <div
              className={cn(
                "flex flex-col items-center justify-center px-8 pt-8 pb-2",
                "text-center",
              )}
            >
              <span
                className={cn(
                  "text-xs font-semibold tracking-widest text-muted uppercase",
                )}
              >
                Chair Flight
              </span>
              <h1
                className={cn(
                  "m-0 bg-linear-to-b from-ink to-accent bg-clip-text",
                  "text-5xl leading-tight font-bold tracking-tight",
                  "text-transparent lg:text-6xl",
                )}
              >
                {shortTitle}
              </h1>
            </div>
          </Search.Lead>
          <Search.Bar
            value={query}
            placeholder="Search chapters, questions and explanations..."
            onChange={setQuery}
          />
          {empty && !searching && (
            <Search.Empty>Nothing found for “{trimmed}”.</Search.Empty>
          )}
          {results && !empty && (
            <Search.Results>
              {results.chapters.length > 0 && (
                <Search.Group title="Chapters">
                  {results.chapters.map((chapter) => (
                    <Search.Item
                      key={chapter.id}
                      link={{
                        to: "/question-banks/$questionBank/content/$contentId",
                        params: {
                          questionBank,

                          contentId: chapter.id,
                        },
                      }}
                      className="items-baseline gap-3"
                    >
                      <span className="font-mono font-semibold text-accent">
                        {chapter.id}
                      </span>
                      <span className="font-semibold">
                        <Highlight highlight={results.words}>
                          {chapter.title}
                        </Highlight>
                      </span>
                      <span className="ml-auto text-xs text-muted">
                        {chapter.numberOfQuestions} questions
                      </span>
                    </Search.Item>
                  ))}
                </Search.Group>
              )}
              {results.questions.length > 0 && (
                <Search.Group title="Questions">
                  {results.questions.map((question) => (
                    <Search.Item
                      key={question.id}
                      link={{
                        to: "/question-banks/$questionBank/questions/$question",
                        params: { questionBank, question: question.id },
                        search: { variant: question.variant },
                      }}
                      className="flex-col gap-2"
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-accent">
                          {question.id}
                        </span>
                        <span className="text-muted">
                          {question.chapterId} · {question.chapterTitle}
                        </span>
                        {question.variantCount > 1 && (
                          <span className="ml-auto text-muted">
                            v{question.variant} of {question.variantCount}
                          </span>
                        )}
                      </span>
                      <span className="line-clamp-3 font-medium">
                        <Highlight highlight={results.words}>
                          {question.question.split("\n")[0] ?? ""}
                        </Highlight>
                      </span>
                      <span className="line-clamp-2 text-muted">
                        ✅{" "}
                        <Highlight highlight={results.words}>
                          {question.answer}
                        </Highlight>
                      </span>
                      {question.explanationSnippet && (
                        <span className="line-clamp-3 border-l-2 border-rule-strong pl-3 text-xs text-muted">
                          <Highlight highlight={results.words}>
                            {question.explanationSnippet}
                          </Highlight>
                        </span>
                      )}
                    </Search.Item>
                  ))}
                </Search.Group>
              )}
            </Search.Results>
          )}
        </Search>
      </Public.Main>
    </Public>
  );
};

const SearchPage: FC = () => {
  const { questionBank } = paramsSchema.parse(Route.useParams());
  if (questionBank === "a320" || questionBank === "b737")
    return <TypeRatingSearchPage questionBank={questionBank} />;
  return <EasaSearchPage questionBank={questionBank} />;
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/search",
)({
  component: SearchPage,
  validateSearch: z.object({
    query: z.catch(z.optional(z.string()), undefined),
  }),
  loader: ({ params }) => getSearchPageData({ data: params as ParamsType }),
  head: ({ loaderData }) =>
    buildPageHead({ title: `Search · ${loaderData?.shortTitle}` }),
});

type ParamsType = z.infer<typeof paramsSchema>;
