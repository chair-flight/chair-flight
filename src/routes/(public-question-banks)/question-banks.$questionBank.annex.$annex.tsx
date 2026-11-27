import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod/mini";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { questionBankRawQuestionAnnexAnnotationSchema as annotationSchema } from "../../libs/core/content/question-bank-raw-question-annex-annotation";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { QuestionAnnexViewer } from "../../libs/ui/components/elements/question-annex-viewer";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../libs/core/content/question-bank-raw-question-annex-annotation";

const paramsSchema = z.object({
  annex: z.string(),
  questionBank: questionBankNameSchema,
});

const getAnnexPageData = createServerFn({ method: "GET" })
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const db = getQuestionBankDb();
    const qb = await db.getQuestionBank(data.questionBank);
    const annex = qb.annexes.find((i) => i.id === data.annex);
    if (!annex) throw notFound();

    return annex;
  });

const AnnexPage: FC = () => {
  const annex = Route.useLoaderData();
  const search = Route.useSearch();
  const [drawings, setDrawings] = useState<Annotation[]>([]);

  return (
    <main className="grid h-dvh place-items-center bg-canvas">
      <QuestionAnnexViewer
        href={annex.href}
        editable={search.editable}
        annotations={search.annotations}
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
    annotations: z.optional(z.array(annotationSchema)),
    editable: z.optional(z.boolean()),
  }),
  loader: ({ params }) =>
    getAnnexPageData({
      data: paramsSchema.parse(params),
    }),
  head: ({ params, loaderData }) =>
    buildPageHead({
      title: `Annex · ${params.annex}`,
      image: loaderData?.href,
      description: loaderData?.description,
    }),
});
