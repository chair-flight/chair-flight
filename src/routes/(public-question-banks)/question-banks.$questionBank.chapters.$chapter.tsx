import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod/mini";
import { formatQuestionPreviewAsMarkdown } from "../../libs/base/format-values";
import { searchQuestions } from "../../libs/core/search/search-questions";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Button } from "../../libs/ui/components/base/button";
import { Input } from "../../libs/ui/components/base/input";
import { SearchHighlightContext } from "../../libs/ui/components/base/search-highlight-context";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionPreviewCard } from "../../libs/ui/components/elements/question-preview-card";
import { TitlePage } from "../../libs/ui/components/elements/title-page";
import { PlayIcon } from "../../libs/ui/icons/play-icon";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;

const getChaptersPageData = createServerFn({ method: "GET" })
  .validator(z.object({ chapter: z.string(), questionBank: z.string() }))
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as "atpl_a";
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const index = await getQuestionBankDb().getQuestionBank(questionBank);
    const chapter = index.chaptersMap.get(data.chapter);
    if (!chapter) throw notFound();

    const subject = index.subjectsMap.get(chapter.subject);
    if (!subject) throw notFound();

    const questions = index.questions
      .filter((question) => question.chapterId === chapter.id)
      .map(({ id, previews, numberOfVariants }) => ({
        id,
        preview: formatQuestionPreviewAsMarkdown(previews[0]),
        numberOfVariants,
      }));

    const { shortTitle } = index;
    const hasSubjects = index.subjects.length > 1;

    return {
      questionBank,
      shortTitle,
      questions,
      chapter,
      parent: hasSubjects ? `${subject.longName}` : "Chapters",
      breadcrumbs: [
        {
          label: shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        {
          label: "Chapters",
          link: {
            to: "/question-banks/$questionBank/chapters" as const,
            params: { questionBank },
          },
        },
        {
          label: hasSubjects ? chapter.id : `Chapter ${Number(chapter.id)}`,
        },
      ],
    };
  });

const ChapterQuestionsPage: FC = () => {
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { questionBank, questions, chapter, parent, breadcrumbs } = data;

  const visibleQuestions = useMemo(() => {
    if (!query.trim()) return questions;
    const { items } = searchQuestions({
      allQuestions: questions,
      candidates: questions,
      query,
      limit: questions.length,
    });
    const matchingIds = new Set(items.map((item) => item.id));
    return questions.filter((question) => matchingIds.has(question.id));
  }, [questions, query]);

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-8">
          <TitlePage
            size="large"
            parent={{
              label: parent,
              link: {
                to: "/question-banks/$questionBank/chapters",
                params: { questionBank },
              },
            }}
            caption={chapter.id}
            title={chapter.title}
            action={
              questions.length > 0 && (
                <Button
                  variant="primary"
                  size="medium"
                  className="shrink-0"
                  onClick={() => {
                    navigate({
                      to: "/question-banks/$questionBank/study-session",
                      params: { questionBank },
                      search: { kind: "chapter", id: chapter.id },
                    });
                  }}
                >
                  <PlayIcon size={16} />
                  Study
                </Button>
              )
            }
          />
          {questions.length === 0 && (
            <p className="m-0 text-sm text-muted">
              No questions available for this chapter.
            </p>
          )}
          {questions.length > 0 && (
            <div className="flex flex-col gap-1">
              <Input
                label="Search questions"
                hideLabel
                type="search"
                placeholder="Search questions in this chapter..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className="text-xs text-muted">
                {visibleQuestions.length} of {questions.length}
              </span>
            </div>
          )}
          {questions.length > 0 && visibleQuestions.length === 0 && (
            <p className="m-0 text-sm text-muted">
              No questions match “{query.trim()}”.
            </p>
          )}
          <SearchHighlightContext value={query.trim()}>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {visibleQuestions.map((question) => (
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
                                    to: "/question-banks/$questionBank/chapters/$chapter",
                                    params: {
                                      questionBank,
                                      chapter: chapter.id,
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
          </SearchHighlightContext>
        </div>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/chapters/$chapter",
)({
  component: ChapterQuestionsPage,
  loader: ({ params }) => getChaptersPageData({ data: params }),
  head: ({ loaderData }) =>
    buildPageHead({
      title: `${loaderData?.chapter.title} · ${loaderData?.shortTitle}`,
    }),
});
