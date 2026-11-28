import {
  createFileRoute,
  Navigate,
  notFound,
  Outlet,
  useMatchRoute,
} from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod/mini";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { TestNotFound } from "../../libs/ui/components/tests/test-not-found";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { TestRouteContext } from "../-hooks/use-test-route";
import { useTests } from "../-hooks/use-tests";
import type { FC } from "react";

const paramsSchema = z.object({
  questionBank: questionBankNameSchema,
  testId: z.string().check(z.minLength(1)),
});

const TEST_ROUTES = {
  exam: "/question-banks/$questionBank/tests/$testId/exam",
  study: "/question-banks/$questionBank/tests/$testId/study",
  review: "/question-banks/$questionBank/tests/$testId/review",
} as const;

const TestIdPage: FC = () => {
  const params = Route.useParams();
  const { tests, saveTest } = useTests();
  const matchRoute = useMatchRoute();
  const test = tests.find(
    (item) =>
      item.id === params.testId && item.questionBank === params.questionBank,
  );
  const context = useMemo(
    () => (test ? { test, saveTest } : null),
    [saveTest, test],
  );

  if (!test) return <TestNotFound />;

  const to = TEST_ROUTES[test.status === "finished" ? "review" : test.mode];
  if (!matchRoute({ to, params }))
    return <Navigate to={to} params={params} replace />;

  return (
    <TestRouteContext key={test.id} value={context}>
      <Outlet />
    </TestRouteContext>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/tests/$testId",
)({
  component: TestIdPage,
  ssr: false,
  loader: ({ params }) => {
    console.log("hi");
    if (paramsSchema.safeParse(params).error) throw notFound();
  },
  head: () => buildPageHead({ title: "Test · Chair Flight" }),
});
