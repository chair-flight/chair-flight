import { createFileRoute } from "@tanstack/react-router";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { TestAttempt } from "./-test-attempt";
import type { FC } from "react";

const TestExamPage: FC = () => <TestAttempt />;

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/tests/$testId/exam",
)({
  component: TestExamPage,
  head: () => buildPageHead({ title: "Exam · Chair Flight" }),
});
