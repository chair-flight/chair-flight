import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { BackgroundForPublic } from "../../libs/ui/components/backgrounds/background-for-public";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionBankPreviewCard } from "../../libs/ui/components/elements/question-bank-preview-card";
import { AirplaneAirbus320 } from "../../libs/ui/components/outlines/airplane-airbus-320";
import { AirplaneBoeing737 } from "../../libs/ui/components/outlines/airplane-boeing-737";
import { AirplaneCessna172 } from "../../libs/ui/components/outlines/airplane-cessna-172";
import { AirplaneTecnamP2006t } from "../../libs/ui/components/outlines/airplane-tecnam-p2006t";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

const KEYS = ["atpl_a", "ppl_a", "a320", "b737"] as const;

const OUTLINES = {
  atpl_a: { Outline: AirplaneTecnamP2006t, position: "bottom-right" },
  ppl_a: { Outline: AirplaneCessna172, position: "bottom-right" },
  a320: { Outline: AirplaneAirbus320, position: "bottom" },
  b737: { Outline: AirplaneBoeing737, position: "bottom" },
} as const;

const getModulePickerPageData = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async () => {
    const db = getQuestionBankDb();
    const indexes = await Promise.all(KEYS.map((n) => db.getQuestionBank(n)));
    const questionBanks = indexes.map((index, position) => ({
      name: KEYS[position],
      shortTitle: index.shortTitle,
      subtitle: index.subtitle,
      numberOfQuestions: index.questions.length,
    }));

    return { questionBanks };
  });

const ModulePickerPage: FC = () => {
  const { questionBanks } = Route.useLoaderData();

  return (
    <Public>
      <BackgroundForPublic />
      <Public.Header showBlogLink showGithubLink showThemeToggle />
      <Public.Main>
        <div
          className={cn(
            "mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6",
            "sm:py-8",
          )}
        >
          <h1 className="m-0 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            Question Bank
          </h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {questionBanks.map((questionBank) => (
              <QuestionBankPreviewCard
                key={questionBank.name}
                kind={questionBank.subtitle}
                title={questionBank.shortTitle}
                numberOfQuestions={questionBank.numberOfQuestions}
                Outline={OUTLINES[questionBank.name].Outline}
                outlinePosition={OUTLINES[questionBank.name].position}
                link={{
                  to: "/question-banks/$questionBank",
                  params: { questionBank: questionBank.name },
                  preload: "intent",
                }}
              />
            ))}
          </div>
        </div>
        <Public.Footer />
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/",
)({
  component: ModulePickerPage,
  loader: () => getModulePickerPageData(),
  head: () =>
    buildPageHead({
      title: "Chair Flight · Question Banks",
      path: "/question-banks",
    }),
});
