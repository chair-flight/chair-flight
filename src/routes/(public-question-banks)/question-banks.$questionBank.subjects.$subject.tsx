import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod/mini";
import { formatQuestionPreviewAsMarkdown } from "../../libs/base/format-values";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Button } from "../../libs/ui/components/base/button";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionPreviewCard } from "../../libs/ui/components/elements/question-preview-card";
import { TitlePage } from "../../libs/ui/components/elements/title-page";
import { BookIcon } from "../../libs/ui/icons/book-icon";
import { PlayIcon } from "../../libs/ui/icons/play-icon";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const QUESTION_BANKS = ["ppl_a"] as const;

const getSubjectPageData = createServerFn({ method: "GET" })
  .validator(z.object({ subject: z.string(), questionBank: z.string() }))
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as "ppl_a";
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const subject = index.subjects.find(({ id }) => id === data.subject);
    if (!subject) throw notFound();

    const learningObjectives = index.learningObjectives;
    const learningObjectiveIds = learningObjectives
      .filter((learningObjective) => learningObjective.subject === subject.id)
      .map(({ id }) => id);
    const questions = index.questions
      .filter((question) =>
        question.learningObjectiveIds.some((id) =>
          learningObjectiveIds.includes(id),
        ),
      )
      .map(({ id, previews, numberOfVariants }) => ({
        id,
        preview: formatQuestionPreviewAsMarkdown(previews[0]),
        numberOfVariants,
      }));

    return {
      questionBank,
      questions,
      subject,
      breadcrumbs: [
        {
          label: index.shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        {
          label: "Subjects",
          link: {
            to: "/question-banks/$questionBank/subjects" as const,
            params: { questionBank },
          },
        },
        { label: subject.id },
      ],
    };
  });

const SubjectQuestionsPage: FC = () => {
  const { questionBank, questions, subject, breadcrumbs } =
    Route.useLoaderData();

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-8">
          <TitlePage
            size="large"
            parent={{
              label: "Subjects",
              link: {
                to: "/question-banks/$questionBank/subjects",
                params: { questionBank },
              },
            }}
            caption={subject.id}
            title={subject.longName}
          />
          {questions.length > 0 && (
            <Link
              to="/question-banks/$questionBank/study-session"
              params={{ questionBank }}
              search={{ kind: "subject", id: subject.id }}
              className="self-start no-underline"
            >
              <Button variant="primary" size="medium" tabIndex={-1}>
                <PlayIcon size={16} />
                Study this subject
              </Button>
            </Link>
          )}
          <Link
            to="/question-banks/$questionBank/learning-objectives"
            params={{ questionBank }}
            search={{ q: `parent:${subject.id}` }}
            className="self-start no-underline"
          >
            <Button variant="primary" size="medium" tabIndex={-1}>
              <BookIcon size={16} />
              Learning objectives
            </Button>
          </Link>
          {questions.length === 0 && (
            <p className="m-0 text-sm text-muted">
              No questions available for this subject.
            </p>
          )}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {questions.map((question) => (
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
                                  to: "/question-banks/$questionBank/subjects/$subject",
                                  params: { questionBank, subject: subject.id },
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
        </div>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/subjects/$subject",
)({
  component: SubjectQuestionsPage,
  loader: ({ params }) => getSubjectPageData({ data: params }),
  head: ({ loaderData }) =>
    buildPageHead({
      title: `${loaderData?.subject.longName} · Chair Flight`,
    }),
});
