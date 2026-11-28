import { createFileRoute, createLink } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/mini";
import {
  formatEpochAsDate,
  formatMillisecondsAsClock,
} from "../../libs/base/format-values";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getExamDeadline } from "../../libs/core/tests/get-exam-deadline";
import { getTestScore } from "../../libs/core/tests/get-test-score";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Button } from "../../libs/ui/components/base/button";
import { ButtonCard } from "../../libs/ui/components/base/button-card";
import { Public } from "../../libs/ui/components/containers/public";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { useTests } from "../-hooks/use-tests";
import type { FC } from "react";
import type { Test } from "../../libs/core/tests/test";

const paramsSchema = z.object({ questionBank: questionBankNameSchema });

export const getTestsPageData = createServerFn({ method: "GET" })
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank } = data;

    const index = await getQuestionBankDb().getQuestionBank(questionBank);

    return {
      bankBreadcrumb: {
        label: index.shortTitle,
        link: {
          to: "/question-banks/$questionBank" as const,
          params: { questionBank },
        },
      },
    };
  });

const ButtonLink = createLink(Button);

const describeTest = (test: Test) => {
  const mode = test.mode === "exam" ? "Exam" : "Study session";
  const answered = test.questions.filter(
    (question) => question.selectedOptionId,
  ).length;
  const date = formatEpochAsDate(test.createdAtEpochMs);
  if (test.status === "finished") {
    const { score, passed } = getTestScore(test);
    return `${mode} · ${score}% ${passed ? "passed" : "failed"} · ${date}`;
  }
  const remaining =
    test.mode === "exam"
      ? ` · ${formatMillisecondsAsClock(
          Math.max(0, Math.ceil((getExamDeadline(test) - Date.now()) / 1000)) *
            1000,
          test.durationInMs >= 60 * 60 * 1000,
        )} left`
      : "";
  return `${mode} · ${answered}/${test.questions.length} answered${remaining} · ${date}`;
};

const TestsPage: FC = () => {
  const { questionBank } = paramsSchema.parse(Route.useParams());
  const { bankBreadcrumb } = Route.useLoaderData();
  const { tests } = useTests();
  const bankTests = tests
    .filter((test) => test.questionBank === questionBank)
    .toReversed();

  return (
    <Public>
      <Public.Header
        showThemeToggle
        breadcrumbs={[bankBreadcrumb, { label: "Tests" }]}
      />
      <Public.Main>
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="m-0 text-2xl font-bold sm:text-3xl">Your tests</h1>
            <ButtonLink
              to="/question-banks/$questionBank/tests/new"
              params={{ questionBank }}
              variant="primary"
            >
              New test
            </ButtonLink>
          </div>
          {bankTests.length === 0 ? (
            <p className="m-0 text-sm text-muted">
              No tests yet. Your last 10 tests are kept in this browser.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {bankTests.map((test) => (
                <ButtonCard
                  key={test.id}
                  label={
                    test.status === "finished"
                      ? "Review"
                      : test.mode === "exam"
                        ? "Open exam"
                        : "Continue"
                  }
                  title={test.title}
                  subtitle={describeTest(test)}
                  link={{
                    to: "/question-banks/$questionBank/tests/$testId",
                    params: { questionBank, testId: test.id },
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/tests/",
)({
  component: TestsPage,
  ssr: false,
  loader: ({ params }) => getTestsPageData({ data: params as ParamsType }),
  head: ({ params }) =>
    buildPageHead({
      title: "Tests · Chair Flight",
      path: `/question-banks/${params.questionBank}/tests`,
    }),
});

type ParamsType = z.infer<typeof paramsSchema>;
