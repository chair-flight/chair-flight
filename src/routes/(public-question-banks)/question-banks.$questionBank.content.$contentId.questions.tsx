import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod/mini";
import { formatQuestionPreviewAsMarkdown } from "../../libs/base/format-values";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { getQuestionsInScope } from "../../libs/core/question-bank/get-questions-in-scope";
import { searchQuestions } from "../../libs/core/search/search-questions";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { ButtonIcon } from "../../libs/ui/components/base/button-icon";
import { Input } from "../../libs/ui/components/base/input";
import { QuestionViewer } from "../../libs/ui/components/elements/question-viewer";
import { QuestionsTable } from "../../libs/ui/components/elements/questions-table";
import { MoreIcon } from "../../libs/ui/components/icons/more-icon";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import { useQuestionsViewer } from "../-hooks/use-questions-viewer";
import { ContentHeading } from "./-content-heading";
import { ContentStudyDialog } from "./-content-study-dialog";
import type { ChangeEvent, FC } from "react";

const contentLayoutRoute = getRouteApi(
  "/(public-question-banks)/question-banks/$questionBank/content/$contentId",
);

const toolbarActionClassName = cn(
  "cursor-pointer rounded-md border-0 bg-transparent px-3 py-2",
  "text-left text-sm text-accent enabled:hover:bg-accent-soft",
  "disabled:cursor-default disabled:text-muted",
  "md:px-0 md:py-0 md:enabled:hover:bg-transparent md:enabled:hover:underline",
);

const paramsSchema = z.object({
  questionBank: questionBankNameSchema,
  contentId: z.string(),
});

const getContentQuestions = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank, contentId } = data;
    const index = await getQuestionBankDb().getQuestionBank(questionBank);
    const questions = getQuestionsInScope(index, contentId);
    const annexIds = questions.flatMap(getQuestionAnnexIds);
    const annexes = index.annexes.filter((annex) =>
      annexIds.includes(annex.id),
    );
    return { questionBank, questions, annexes, shortTitle: index.shortTitle };
  });

type ParamsType = z.infer<typeof paramsSchema>;

const ContentQuestionsPage: FC = () => {
  const { contentId } = Route.useParams();
  const { label } = contentLayoutRoute.useLoaderData();
  const { questionBank, questions, annexes } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const study = useDisclose();
  const actions = useDisclose();
  const actionsButton = useRef<HTMLButtonElement>(null);
  const actionsPanel = useRef<HTMLDivElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [query, setQuery] = useState(q ?? "");
  const [showAnswers, setShowAnswers] = useState(false);

  const questionItems = useMemo(
    () =>
      questions.map((question) => ({
        id: question.id,
        question: question.previews[0]?.question ?? "",
        answer: question.previews[0]?.answer ?? "",
        numberOfVariants: question.numberOfVariants,
      })),
    [questions],
  );
  const visibleQuestions = useMemo(() => {
    if (!query.trim()) return questions;
    const previews = questions.map((question) => ({
      id: question.id,
      tags: question.tags,
      preview: formatQuestionPreviewAsMarkdown(question.previews[0]),
    }));
    const { items } = searchQuestions({
      allQuestions: previews,
      candidates: previews,
      query,
      limit: previews.length,
    });
    const matchingIds = new Set(items.map((item) => item.id));
    return questions.filter((question) => matchingIds.has(question.id));
  }, [questions, query]);
  const visibleQuestionIds = useMemo(
    () => visibleQuestions.map((question) => question.id),
    [visibleQuestions],
  );
  const highlight = useMemo(() => query.replace(/\S+:\S+/g, ""), [query]);

  const session = useQuestionsViewer({
    questions: visibleQuestions,
    annexes,
    enabled: viewerOpen,
  });
  const currentQuestion = visibleQuestions[session.questionIndex];
  const links = currentQuestion
    ? [currentQuestion.chapterId, ...currentQuestion.learningObjectiveIds].map(
        (id) => ({
          label: id,
          link: {
            to: "/question-banks/$questionBank/content/$contentId" as const,
            params: { questionBank, contentId: id },
          },
        }),
      )
    : [];

  const openViewer = useCallback(
    (id: string) => {
      session.open(id);
      setViewerOpen(true);
    },
    [session.open],
  );

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);
  const dismissActions = useCallback(() => {
    if (!actions.isOpen) return;
    actions.close();
    actionsButton.current?.focus();
  }, [actions.isOpen, actions.close]);

  const practiceQuestions = useCallback(() => {
    if (visibleQuestions.length === 0) return;
    dismissActions();
    openViewer(visibleQuestions[0].id);
  }, [dismissActions, openViewer, visibleQuestions]);
  const openQuickTest = useCallback(() => {
    dismissActions();
    study.open();
  }, [dismissActions, study.open]);
  const changeQuery = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    [],
  );
  const toggleAnswers = useCallback(() => {
    setShowAnswers((previous) => !previous);
    dismissActions();
  }, [dismissActions]);

  const getStudyQuestions = useCallback(
    () => ({ questions, annexes }),
    [questions, annexes],
  );

  useEffect(() => {
    if (!actions.isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !actionsButton.current?.contains(target) &&
        !actionsPanel.current?.contains(target)
      ) {
        actions.close();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissActions();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [actions.isOpen, actions.close, dismissActions]);

  if (viewerOpen) {
    return (
      <div
        data-content-question-viewer
        className="flex min-h-0 flex-1 flex-col"
      >
        {session.viewer && currentQuestion && (
          <QuestionViewer
            {...session.viewer}
            goBack={{ onClick: closeViewer }}
            linkToQuestion={{
              to: "/question-banks/$questionBank/questions/$question",
              params: { questionBank, question: currentQuestion.id },
            }}
            information={{ ...session.viewer.information, links }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-480 flex-1 flex-col gap-2 p-2 sm:gap-3 sm:p-6">
      <ContentHeading
        title={label}
        contentId={contentId}
        subtitle="Questions"
      />
      <div className="relative flex flex-none flex-col gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 flex-1">
            <Input
              label="Filter Questions"
              hideLabel
              type="search"
              placeholder="Filter Questions"
              value={query}
              onChange={changeQuery}
            />
          </div>
          <ButtonIcon
            ref={actionsButton}
            icon={MoreIcon}
            label="Question actions"
            variant="default"
            className="md:hidden"
            aria-expanded={actions.isOpen}
            aria-controls="content-question-actions"
            onClick={actions.toggle}
          />
        </div>
        <div
          id="content-question-actions"
          ref={actionsPanel}
          className={cn(
            "absolute top-full right-0 z-20 mt-1.5 flex w-48 flex-col",
            "rounded-lg border border-rule bg-paper p-1 text-sm shadow-lg",
            "md:static md:mt-0 md:w-auto md:flex-row md:flex-wrap",
            "md:items-center md:gap-x-3 md:gap-y-2 md:border-0",
            "md:bg-transparent md:p-0 md:shadow-none",
            !actions.isOpen && "max-md:hidden",
          )}
        >
          <span
            className={cn(
              "border-b border-rule px-3 py-2 text-muted tabular-nums",
              "md:border-0 md:p-0",
            )}
          >
            {visibleQuestions.length} of {questions.length} questions
          </span>
          <span aria-hidden className="hidden text-muted md:inline">
            |
          </span>
          <button
            type="button"
            className={toolbarActionClassName}
            disabled={visibleQuestions.length === 0}
            onClick={practiceQuestions}
          >
            practice questions
          </button>
          <span aria-hidden className="hidden text-muted md:inline">
            |
          </span>
          <button
            type="button"
            className={toolbarActionClassName}
            disabled={visibleQuestions.length === 0}
            onClick={openQuickTest}
          >
            create quick test
          </button>
          <span aria-hidden className="hidden text-muted md:inline">
            |
          </span>
          <button
            type="button"
            className={toolbarActionClassName}
            aria-pressed={showAnswers}
            onClick={toggleAnswers}
          >
            {showAnswers ? "hide answers" : "show answers"}
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <QuestionsTable
          items={questionItems}
          filterItems={visibleQuestionIds}
          highlight={highlight}
          showAnswers={showAnswers}
          onSelect={openViewer}
        />
      </div>
      {study.isOpen && (
        <ContentStudyDialog
          questionBank={questionBank}
          contentId={contentId}
          questionCount={questions.length}
          loadQuestions={getStudyQuestions}
          onClose={study.close}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/content/$contentId/questions",
)({
  component: ContentQuestionsPage,
  validateSearch: z.object({ q: z.catch(z.optional(z.string()), undefined) }),
  remountDeps: ({ params, search }) => ({ params, q: search.q }),
  loader: ({ params }) => getContentQuestions({ data: params as ParamsType }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `Questions · ${params.contentId} · ${loaderData?.shortTitle}`,
    }),
});
