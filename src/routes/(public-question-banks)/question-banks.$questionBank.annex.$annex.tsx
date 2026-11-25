import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod/mini";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../libs/core/content/question-bank-raw-question-annex-annotation";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;

const getAnnexPageData = createServerFn({ method: "GET" })
  .validator(
    z.object({
      annex: z.string(),
      questionBank: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as "atpl_a";
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const annex = index.annexes.find((i) => i.id === data.annex);
    if (!annex) throw notFound();

    return annex;
  });

const AnnexPage: FC = () => {
  const annex = Route.useLoaderData();
  const { annotated, editable } = Route.useSearch();
  const [drawings, setDrawings] = useState<Annotation[]>([]);

  const href = annotated
    ? `${annex.href}?annotated=${encodeURIComponent(
        typeof annotated === "string" ? annotated : JSON.stringify(annotated),
      )}`
    : annex.href;
  const viewerHref = editable ? `${href}#editable` : href;

  return (
    <main className="grid h-dvh place-items-center bg-canvas">
      <QuestionAnnexViewer
        href={viewerHref}
        drawings={drawings}
        onDrawingsChange={setDrawings}
      />
    </main>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/annex/$annex",
)({
  component: AnnexPage,
  validateSearch: z.object({
    annotated: z.catch(
      z.optional(
        z.union([
          z.string(),
          z.object({
            width: z.optional(z.number()),
            height: z.optional(z.number()),
            annotations: z.optional(z.array(z.unknown())),
          }),
        ]),
      ),
      undefined,
    ),
    editable: z.optional(z.boolean()),
  }),
  loader: ({ params }) => getAnnexPageData({ data: params }),
  head: ({ params, loaderData }) =>
    buildPageHead({
      title: `Annex · ${params.annex}`,
      image: loaderData?.href,
      description: loaderData?.description,
    }),
});
