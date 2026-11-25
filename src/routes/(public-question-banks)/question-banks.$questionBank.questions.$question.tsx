import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { z } from "zod/mini";
import { formatQuestionPreviewAsMarkdown } from "../../libs/base/format-values";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Modal } from "../../libs/ui/components/base/modal";
import { Public } from "../../libs/ui/components/containers/public";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { QuestionMultipleChoice } from "../../libs/ui/components/elements/question-multiple-choice";
import { QuestionViewer } from "../../libs/ui/components/elements/question-viewer";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { useQuestionViewer } from "../-hooks/use-question-viewer";
import type { FC } from "react";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;

const getQuestionPageData = createServerFn({ method: "GET" })
  .validator(z.object({ question: z.string(), questionBank: z.string() }))
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as (typeof QUESTION_BANKS)[number];
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const question = index.questionsMap.get(data.question);
    if (!question) throw notFound();

    const subject = index.subjectsMap.get(question.subjectId);
    const chapter = index.chaptersMap.get(question.chapterId);
    if (!subject || !chapter) throw notFound();

    const annexIds = getQuestionAnnexIds(question);
    const annexes = index.annexes.filter((a) => annexIds.includes(a.id));

    const subjectLink = {
      label: subject.id,
      text: subject.shortName,
      link: {
        to: "/question-banks/$questionBank/subjects/$subject" as const,
        params: { questionBank, subject: subject.id },
      },
    };

    const chapterLink = {
      label: chapter.id,
      text: chapter.title,
      link: {
        to: "/question-banks/$questionBank/chapters/$chapter" as const,
        params: { questionBank, chapter: chapter.id },
      },
    };

    const learningObjectivesLinks = question.learningObjectiveIds.map((id) => ({
      label: id,
      text: index.learningObjectivesMap.get(id)?.text ?? "",
      link: {
        to: "/question-banks/$questionBank/learning-objectives/$learningObject" as const,
        params: { questionBank, learningObject: id },
      },
    }));

    const informationLinks = [
      questionBank === "ppl_a" ? subjectLink : chapterLink,
      ...learningObjectivesLinks,
    ];

    const relatedQuestionLinks = question.relatedQuestionIds.map((id) => ({
      label: id,
      text: formatQuestionPreviewAsMarkdown(
        index.questionsMap.get(id)?.previews[0],
      ),
      link: {
        to: "/question-banks/$questionBank/questions/$question" as const,
        params: { questionBank, question: id },
      },
    }));

    return {
      questionBank,
      shortTitle: index.shortTitle,
      question,
      annexes,
      informationLinks,
      relatedQuestionLinks,
      breadcrumbs: [
        {
          label: index.shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        {
          label: "Questions",
          link: {
            to: "/question-banks/$questionBank/search" as const,
            params: { questionBank },
          },
        },
        {
          label: question.id,
          mono: true,
        },
      ],
    };
  });

const QuestionPage: FC = () => {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!search.breadcrumbs) return;
    navigate({
      to: ".",
      search: (previous) => ({ ...previous, breadcrumbs: undefined }),
      replace: true,
    });
  }, [search.breadcrumbs, navigate]);

  const { viewer, question, annexModal, annexViewer } = useQuestionViewer({
    question: data.question,
    annexes: data.annexes,
    seed: search.seed,
    variant: search.variant,
    tab: search.tab,
    onVariantChange: (variant) =>
      navigate({
        to: ".",
        search: (previous) => ({ ...previous, variant }),
        replace: true,
      }),
    onSeedChange: (seed) =>
      navigate({
        to: ".",
        search: (previous) => ({ ...previous, seed }),
        replace: true,
      }),
    onTabChange: (tab) =>
      navigate({
        to: ".",
        search: (previous) => ({
          ...previous,
          tab: tab === "question" ? undefined : tab,
        }),
        replace: true,
      }),
  });

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={data.breadcrumbs} />
      <Public.Main className="overflow-y-hidden!">
        <QuestionViewer
          {...viewer}
          information={{
            ...viewer.information,
            links: data.informationLinks,
            relatedQuestions: data.relatedQuestionLinks,
          }}
        >
          <QuestionMultipleChoice {...question} />
        </QuestionViewer>
        <Modal {...annexModal}>
          <QuestionAnnexViewer {...annexViewer} />
        </Modal>
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/questions/$question",
)({
  component: QuestionPage,
  validateSearch: z.object({
    variant: z._default(
      z.catch(
        z.coerce.number().check(z.refine(Number.isInteger), z.minimum(1)),
        1,
      ),
      1,
    ),
    seed: z._default(z.optional(z.string()), "default"),
    tab: z._default(
      z.optional(z.enum(["question", "explanation", "variants"])),
      "question",
    ),
    breadcrumbs: z.catch(
      z.optional(
        z.array(
          z.object({
            label: z.string(),
            mono: z.optional(z.boolean()),
            link: z.optional(
              z.object({
                to: z.string(),
                params: z.record(z.string(), z.string()),
                search: z.optional(z.record(z.string(), z.string())),
              }),
            ),
          }),
        ),
      ),
      undefined,
    ),
  }),
  staleTime: Infinity,
  loader: async ({ params, location }) => {
    const data = await getQuestionPageData({ data: params });
    const { breadcrumbs: incoming } = location.search as {
      breadcrumbs?: { label: string; mono?: boolean }[];
    };
    return { ...data, breadcrumbs: incoming ?? data.breadcrumbs };
  },
  head: ({ loaderData }) =>
    buildPageHead({
      title: `${loaderData?.question.id} · ${loaderData?.shortTitle}`,
    }),
});
