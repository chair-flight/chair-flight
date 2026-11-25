import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useState } from "react";
import { z } from "zod/mini";
import { getEasaModuleOverview } from "../../libs/core/question-bank/get-easa-module-overview";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Button } from "../../libs/ui/components/base/button";
import { SliderWithInput } from "../../libs/ui/components/base/slider-with-input";
import { Public } from "../../libs/ui/components/containers/public";
import { TestMaker } from "../../libs/ui/components/tests/test-maker";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import { useTests } from "../-hooks/use-tests";
import { useTypeRatingQuestionBankMetadata } from "../-hooks/use-type-rating-question-bank-metada";
import { buildQuestionBankTest } from "../-server-functions/tests/build-question-bank-test";
import type { ComponentProps, FC, ReactNode } from "react";
import type { TestMakerConfig } from "../../libs/ui/components/tests/test-maker";

const QUESTION_BANKS = ["atpl_a", "ppl_a", "b737", "a320"] as const;

type BreadcrumbItems = ComponentProps<typeof Public.Header>["breadcrumbs"];

type Mode = "exam" | "study";
type Scope = "all" | "pick";

const MAX_QUESTIONS = 200;
const EXAM_QUESTIONS = 40;

const startEasaTest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      questionBank: z.enum(["atpl_a", "ppl_a"]),
      mode: z.enum(["study", "exam"]),
      subject: z.string().check(z.minLength(1)),
      learningObjectiveIds: z
        .array(z.string())
        .check(z.minLength(1), z.maxLength(500)),
      numberOfQuestions: z.int().check(z.minimum(1), z.maximum(200)),
    }),
  )
  .handler(async ({ data }) => {
    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(data.questionBank);
    const { learningObjectives } = index;
    const subject = index.subjectsMap.get(data.subject);
    if (!subject) throw new Error("Subject not found.");
    const subjects = new Map(
      learningObjectives.map((item) => [item.id, item.subject]),
    );
    return buildQuestionBankTest({
      questionBank: data.questionBank,
      mode: data.mode,
      title: `${subject.shortName} ${data.mode === "study" ? "study session" : "exam"}`,
      durationInMinutes: subject.exams[0]?.minutes ?? 0,
      numberOfQuestions: data.numberOfQuestions,
      candidateIds: index.questions
        .filter((question) =>
          question.learningObjectiveIds.some(
            (id) =>
              subjects.get(id) === data.subject &&
              data.learningObjectiveIds.some((prefix) => id.startsWith(prefix)),
          ),
        )
        .map((question) => question.id),
    });
  });

const startTypeRatingTest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      questionBank: z.enum(["a320", "b737"]),
      mode: z.enum(["study", "exam"]),
      chapterIds: z.array(z.string()).check(z.minLength(1), z.maxLength(50)),
      numberOfQuestions: z.int().check(z.minimum(1), z.maximum(200)),
    }),
  )
  .handler(async ({ data }) => {
    const index = await getQuestionBankDb().getQuestionBank(data.questionBank);
    return buildQuestionBankTest({
      questionBank: data.questionBank,
      mode: data.mode,
      title: `${data.questionBank === "a320" ? "A320" : "B737"} ${data.mode === "study" ? "study session" : "exam"}`,
      durationInMinutes: index.subjects[0]?.exams[0]?.minutes ?? 0,
      numberOfQuestions: data.numberOfQuestions,
      candidateIds: index.questions
        .filter((question) => data.chapterIds.includes(question.chapterId))
        .map((question) => question.id),
    });
  });

const TypeRatingTestBuilderStep: FC<{
  title: string;
  children: ReactNode;
}> = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="m-0 text-base font-bold">{title}</h2>
    {children}
  </section>
);

const TypeRatingTestBuilderOption: FC<{
  selected: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ selected, label, hint, disabled, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "flex min-h-11 flex-1 cursor-pointer flex-col items-center",
      "justify-center gap-1 rounded-lg border-2 bg-paper px-3 py-2",
      "text-sm font-semibold text-ink",
      selected
        ? "border-accent text-accent"
        : "border-rule hover:border-accent",
      "disabled:cursor-default disabled:opacity-60",
    )}
  >
    {label}
    {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
  </button>
);

const TypeRatingTestBuilder: FC<{
  chapters: {
    id: string;
    title: string;
    numberOfQuestions: number;
  }[];
  presetChapterId?: string;
  questionBank: "a320" | "b737";
}> = ({ chapters, presetChapterId, questionBank }) => {
  const navigate = useNavigate();
  const { saveTest } = useTests();
  const presetChapter = chapters.find((item) => item.id === presetChapterId);
  const [mode, setMode] = useState<Mode | null>(presetChapter ? "study" : null);
  const [scope, setScope] = useState<Scope | null>(
    presetChapter ? "pick" : null,
  );
  const [chapterId, setChapterId] = useState<string | null>(
    presetChapter?.id ?? null,
  );
  const [choosing, setChoosing] = useState(!presetChapter);
  const [requested, setRequested] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isExam = mode === "exam";
  const effectiveScope = isExam ? "all" : scope;
  const chapter = chapters.find((item) => item.id === chapterId);
  const selectedChapters =
    effectiveScope === "all" ? chapters : chapter ? [chapter] : [];
  const available = selectedChapters.reduce(
    (total, chapter) => total + chapter.numberOfQuestions,
    0,
  );
  const maxQuestions = Math.max(1, Math.min(MAX_QUESTIONS, available));
  const numberOfQuestions = isExam
    ? Math.min(EXAM_QUESTIONS, maxQuestions)
    : Math.min(requested, maxQuestions);
  const scopeReady =
    available > 0 &&
    (effectiveScope === "all" || (effectiveScope === "pick" && !choosing));

  const start = async () => {
    if (!mode || !scopeReady || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const test = await startTypeRatingTest({
        data: {
          questionBank,
          mode,
          chapterIds: selectedChapters.map((chapter) => chapter.id),
          numberOfQuestions,
        },
      });
      saveTest(test);
      await navigate({
        to: "/question-banks/$questionBank/tests/$test",
        params: { questionBank, test: test.id },
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-xl flex-col gap-5",
        "overflow-hidden p-4 sm:p-8",
      )}
    >
      <h1 className="m-0 flex-none text-2xl font-bold sm:text-3xl">
        Create a test
      </h1>

      <TypeRatingTestBuilderStep title="Choose a mode">
        <div className="flex gap-2">
          <TypeRatingTestBuilderOption
            selected={mode === "exam"}
            label="Exam"
            hint={
              mode
                ? undefined
                : `${EXAM_QUESTIONS} questions, all chapters. You can't see your results until you finish.`
            }
            onClick={() => setMode("exam")}
          />
          <TypeRatingTestBuilderOption
            selected={mode === "study"}
            label="Study"
            hint={
              mode
                ? undefined
                : cn(
                    "Configure a study session and see if your answers are correct as you go.",
                  )
            }
            onClick={() => setMode("study")}
          />
        </div>
      </TypeRatingTestBuilderStep>

      {mode === "exam" && (
        <TypeRatingTestBuilderStep title="Choose chapters">
          <div className="flex gap-2">
            <TypeRatingTestBuilderOption
              selected
              label="All chapters"
              disabled
            />
          </div>
        </TypeRatingTestBuilderStep>
      )}

      {mode === "study" && (
        <TypeRatingTestBuilderStep title="Choose chapters">
          <div className="flex gap-2">
            <TypeRatingTestBuilderOption
              selected={scope === "all"}
              label="All chapters"
              onClick={() => setScope("all")}
            />
            <TypeRatingTestBuilderOption
              selected={scope === "pick"}
              label="Pick a chapter"
              onClick={() => {
                setScope("pick");
                setChapterId(null);
                setChoosing(true);
              }}
            />
          </div>
        </TypeRatingTestBuilderStep>
      )}

      {mode === "study" && scope === "pick" && (
        <section
          className={cn("flex min-h-0 flex-col gap-3", choosing && "flex-1")}
        >
          <h2 className="m-0 flex-none text-base font-bold">Chapter</h2>
          {choosing || !chapter ? (
            <ul
              className={cn(
                "m-0 flex min-h-0 flex-1 list-none flex-col",
                "overflow-auto",
                "overscroll-contain rounded-lg border border-rule bg-paper p-0",
              )}
            >
              {chapters.map((item) => (
                <li
                  key={item.id}
                  className="flex-none border-b border-rule last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setChapterId(item.id);
                      setChoosing(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer flex-col border-0",
                      "bg-transparent",
                      "p-3 text-left text-ink hover:text-accent",
                      item.id === chapterId && "text-accent",
                    )}
                  >
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted">
                      {item.numberOfQuestions} questions
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => setChoosing(true)}
              className={cn(
                "flex w-full cursor-pointer flex-col rounded-lg border-2",
                "border-accent bg-paper p-3 text-left text-accent",
              )}
            >
              <span className="text-sm font-medium">{chapter.title}</span>
              <span className="text-xs text-muted">
                {chapter.numberOfQuestions} questions
              </span>
            </button>
          )}
        </section>
      )}

      {mode && scopeReady && (
        <TypeRatingTestBuilderStep title="Number of questions">
          <SliderWithInput
            min={1}
            max={maxQuestions}
            value={numberOfQuestions}
            disabled={isExam || submitting}
            onChange={setRequested}
          />
        </TypeRatingTestBuilderStep>
      )}

      <div className="mt-auto flex flex-none flex-col gap-2">
        {error && <p className="m-0 text-sm text-danger">{error}</p>}
        <Button
          variant="primary"
          size="large"
          className="w-full"
          disabled={!mode || !scopeReady || submitting}
          onClick={start}
        >
          {submitting ? "Creating..." : "Start"}
        </Button>
      </div>
    </div>
  );
};

const getNewTestPageData = createServerFn({ method: "GET" })
  .validator(z.object({ questionBank: z.string() }))
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }) => {
    const questionBank = data.questionBank as (typeof QUESTION_BANKS)[number];
    if (!QUESTION_BANKS.includes(questionBank)) throw notFound();

    const db = getQuestionBankDb();
    const index = await db.getQuestionBank(questionBank);
    const breadcrumbs = [
      {
        label: index.shortTitle,
        link: {
          to: "/question-banks/$questionBank" as const,
          params: { questionBank },
        },
      },
      {
        label: "Tests",
        link: {
          to: "/question-banks/$questionBank/tests" as const,
          params: { questionBank },
        },
      },
      { label: "New test" },
    ];

    if (questionBank === "a320" || questionBank === "b737") {
      const chapters = index.chapters.map((chapter) => ({
        ...chapter,
        numberOfQuestions: index.questions.filter(
          (question) => question.chapterId === chapter.id,
        ).length,
      }));
      const metadata = {
        title: index.title,
        description: index.description,
        chapters,
        numberOfQuestions: chapters.reduce(
          (total, chapter) => total + chapter.numberOfQuestions,
          0,
        ),
      };
      return {
        kind: "type-rating",
        questionBank,
        metadata,
        breadcrumbs,
      } as const;
    }

    const learningObjectives = index.learningObjectives;
    const overview = getEasaModuleOverview(index, learningObjectives, 2);
    return {
      kind: "easa",
      questionBank,
      subjects: overview.subjects,
      breadcrumbs,
    } as const;
  });

type NewTestPageData = Awaited<ReturnType<typeof getNewTestPageData>>;

const EasaCreateTestPage: FC<{
  questionBank: "atpl_a" | "ppl_a";
  subjects: Extract<NewTestPageData, { kind: "easa" }>["subjects"];
  breadcrumbs: BreadcrumbItems;
}> = ({ questionBank, subjects, breadcrumbs }) => {
  const navigate = Route.useNavigate();
  const { saveTest } = useTests();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createNewTest = async (config: TestMakerConfig) => {
    setSubmitting(true);
    setError("");
    try {
      const test = await startEasaTest({ data: { questionBank, ...config } });
      saveTest(test);
      await navigate({
        to: "/question-banks/$questionBank/tests/$test",
        params: { questionBank, test: test.id },
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <TestMaker
          subjects={subjects}
          wide
          submitting={submitting}
          error={error}
          onSubmit={createNewTest}
        />
      </Public.Main>
    </Public>
  );
};

const TypeRatingCreateTestPage: FC<{
  questionBank: "a320" | "b737";
  metadata: Extract<NewTestPageData, { kind: "type-rating" }>["metadata"];
  breadcrumbs: BreadcrumbItems;
}> = ({ questionBank, metadata, breadcrumbs }) => {
  const { chaptersWithQuestions: chapters } =
    useTypeRatingQuestionBankMetadata(metadata);
  const { chapter } = Route.useSearch();

  return (
    <Public>
      <Public.Header showThemeToggle breadcrumbs={breadcrumbs} />
      <Public.Main>
        <TypeRatingTestBuilder
          key={chapter}
          chapters={chapters}
          presetChapterId={chapter}
          questionBank={questionBank}
        />
      </Public.Main>
    </Public>
  );
};

const CreateTestPage: FC = () => {
  const data = Route.useLoaderData();
  if (data.kind === "type-rating")
    return (
      <TypeRatingCreateTestPage
        questionBank={data.questionBank}
        metadata={data.metadata}
        breadcrumbs={data.breadcrumbs}
      />
    );
  return (
    <EasaCreateTestPage
      questionBank={data.questionBank}
      subjects={data.subjects}
      breadcrumbs={data.breadcrumbs}
    />
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/tests/new",
)({
  component: CreateTestPage,
  validateSearch: z.object({ chapter: z.optional(z.string()) }),
  loader: ({ params }) => getNewTestPageData({ data: params }),
  head: ({ loaderData }) =>
    buildPageHead({ title: `New test · ${loaderData?.breadcrumbs[0]?.label}` }),
});
