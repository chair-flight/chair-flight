import { createFileRoute, createLink, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { z } from "zod/mini";
import { getChapterSelection } from "../../libs/core/question-bank/get-chapter-selection";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { BackgroundForAirbus320QuestionBank } from "../../libs/ui/backgrounds/background-for-airbus-320-question-bank";
import { BackgroundForAtplQuestionBank } from "../../libs/ui/backgrounds/background-for-atpl-question-bank";
import { BackgroundForBoeing737QuestionBank } from "../../libs/ui/backgrounds/background-for-boeing-737-question-bank";
import { BackgroundForPplQuestionBank } from "../../libs/ui/backgrounds/background-for-ppl-question-bank";
import { Button } from "../../libs/ui/components/base/button";
import { ButtonCard } from "../../libs/ui/components/base/button-card";
import { ButtonSearchBar } from "../../libs/ui/components/base/button-search-bar";
import { LandingPage } from "../../libs/ui/components/containers/landing-page";
import { Public } from "../../libs/ui/components/containers/public";
import { ChapterSelection } from "../../libs/ui/components/elements/chapter-selection";
import { PlayIcon } from "../../libs/ui/icons/play-icon";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;

const ButtonLink = createLink(Button);
const ButtonSearchBarLink = createLink(ButtonSearchBar);

const getQuestionBankHomePageData = createServerFn({ method: "GET" })
  .validator(z.object({ questionBank: z.string() }))
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as (typeof QUESTION_BANKS)[number];
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const los = index.learningObjectives;
    return {
      questionBank,
      shortTitle: index.shortTitle,
      subtitle: index.subtitle,
      title: index.title,
      description: index.description,
      chapters: getChapterSelection(questionBank, index, los),
      breadcrumbs: [
        {
          label: index.shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
      ],
    };
  });

const QuestionBankHomePage: FC = () => {
  const { questionBank, shortTitle, subtitle, chapters, breadcrumbs } =
    Route.useLoaderData();

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main className="relative">
        <Public.BackgroundContainer>
          {questionBank === "atpl_a" && (
            <BackgroundForAtplQuestionBank className="opacity-30" />
          )}
          {questionBank === "ppl_a" && (
            <BackgroundForPplQuestionBank className="opacity-30" />
          )}
          {questionBank === "a320" && (
            <BackgroundForAirbus320QuestionBank className="opacity-30" />
          )}
          {questionBank === "b737" && (
            <BackgroundForBoeing737QuestionBank className="opacity-30" />
          )}
        </Public.BackgroundContainer>
        <Public.SectionA>
          <div
            className={cn(
              "mx-auto flex w-full max-w-sm flex-col gap-4 p-4 pt-[18vh]",
              "sm:p-8 sm:pt-[18vh] lg:max-w-5xl lg:flex-1 lg:flex-row",
              "lg:items-center lg:gap-0 lg:p-12 lg:pt-12",
            )}
          >
            <div
              className={cn(
                "mb-4 flex flex-col items-center lg:mb-0 lg:flex-1 lg:pr-16",
                "[&>span]:-mb-1 [&>span]:text-sm [&>span]:font-semibold",
                "[&>span]:tracking-widest [&>span]:text-muted",
                "[&>span]:uppercase",
              )}
            >
              <span>Chair Flight</span>
              <div
                className={cn(
                  "flex flex-col items-center bg-linear-to-b",
                  "from-[color-mix(in_srgb,var(--ink)_70%,var(--accent))]",
                  "to-accent bg-clip-text text-transparent",
                  "*:m-0 *:text-center *:font-bold",
                  "[&>h1]:text-8xl [&>h1]:tracking-tight",
                  "lg:[&>h1]:text-[10rem] lg:[&>h1]:leading-none",
                  "[&>p]:text-2xl [&>p]:tracking-widest lg:[&>p]:text-4xl",
                )}
              >
                <h1>{shortTitle}</h1>
                <p>{subtitle}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:flex-1 lg:pl-16 lg:gap-4">
              <ButtonLink
                to="/question-banks/$questionBank/tests/new"
                params={{ questionBank }}
                variant="primary"
                size="large"
                className="w-full"
              >
                <PlayIcon size={20} />
                Take a test
              </ButtonLink>
              <ButtonSearchBarLink
                to="/question-banks/$questionBank/search"
                params={{ questionBank }}
                label="Search"
              />
            </div>
          </div>
          <LandingPage.ExploreContent
            text="Explore content"
            onClick={() => {
              document
                .getElementById("content")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </Public.SectionA>
        <Public.SectionB id="content">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:gap-8 md:p-8">
            <ChapterSelection
              title={
                {
                  atpl_a: "Questions by Subject",
                  ppl_a: "Questions by Subject",
                  b737: "Questions by Chapter",
                  a320: "Questions by Chapter",
                }[questionBank]
              }
              chapters={chapters}
              getLink={(chapterId) =>
                questionBank === "ppl_a"
                  ? {
                      to: "/question-banks/$questionBank/subjects/$subject",
                      params: { questionBank, subject: chapterId },
                    }
                  : {
                      to: "/question-banks/$questionBank/chapters/$chapter",
                      params: { questionBank, chapter: chapterId },
                    }
              }
            />
            {(questionBank === "atpl_a" || questionBank === "ppl_a") && (
              <>
                <h2
                  className={cn(
                    "m-0 text-center text-xs font-semibold tracking-widest",
                    "text-muted uppercase",
                  )}
                >
                  Learning objectives
                </h2>
                <ul className="m-0 mx-auto flex w-full max-w-sm list-none flex-col p-0">
                  <ButtonCard
                    title="Learning objectives"
                    subtitle="Browse the syllabus"
                    link={{
                      to: "/question-banks/$questionBank/learning-objectives",
                      params: { questionBank },
                    }}
                  />
                </ul>
              </>
            )}
          </div>
        </Public.SectionB>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/",
)({
  component: QuestionBankHomePage,
  loader: ({ params }) => getQuestionBankHomePageData({ data: params }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `${loaderData?.title} · Chair Flight`,
      description: loaderData?.description,
      path: `/question-banks/${params.questionBank}`,
    }),
});
