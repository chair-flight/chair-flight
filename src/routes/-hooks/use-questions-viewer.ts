import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getRandomId } from "../../libs/base/random";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { parseAnnexHref } from "../../libs/core/question-templates/parse-annotated-annex-href";
import { createTestQuestion } from "../../libs/core/tests/create-test-question";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { useKeyboardShortcuts } from "../../libs/ui/hooks/use-keyboard-shortcuts";
import { useLocalStorage } from "../../libs/ui/hooks/use-local-storage";
import type {
  QuestionBankAnnex,
  QuestionBankQuestion,
} from "../../libs/core/content/question-bank-index";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../libs/core/content/question-bank-raw-question-annex-annotation";

type Tab = "question" | "explanation";
type Result = "correct" | "wrong" | null;
type Answer = string | null;
type DrawingsMap = Record<string, Annotation[]>;

const OPTION_FOCUS_KEY = "chair-flight-question-option-focus";

const initAnswers = (a: unknown[]) => Array.from(a, () => null);
const initSeeds = (a: unknown[]) => Array.from(a, () => "K");
const initVariants = (a: unknown[]) => Array.from(a, () => 1);
const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

const findQuestionIndex = (questions: QuestionBankQuestion[], id?: string) => {
  const questionIndex = questions.findIndex((question) => question.id === id);
  return Math.max(questionIndex, 0);
};

export const useQuestionsViewer = ({
  questions,
  annexes,
  initialQuestionId,
  enabled = true,
}: {
  questions: QuestionBankQuestion[];
  annexes: QuestionBankAnnex[];
  initialQuestionId?: string;
  enabled?: boolean;
}) => {
  const initialQuestionIndex = findQuestionIndex(questions, initialQuestionId);
  const annexModal = useDisclose();
  const [tab, setTab] = useState<Tab>("question");
  const [shakes, setShakes] = useState(0);
  const [annexHref, setAnnexHref] = useState("");
  const [drawingsByAnnex, setDrawingsByAnnex] = useState<DrawingsMap>({});
  const [localOptionFocus, setLocalOptionFocus] = useState<number | null>(null);
  const [questionIndex, setQuestionIndex] = useState(initialQuestionIndex);
  const [seeds, setSeeds] = useState<string[]>(() => initSeeds(questions));
  const [answers, setAnswers] = useState<Answer[]>(initAnswers(questions));
  const [results, setResults] = useState<Result[]>(initAnswers(questions));
  const [variants, setVariants] = useState<number[]>(initVariants(questions));
  const { value: storedOptionFocus, update: saveOptionFocus } =
    useLocalStorage<number>(OPTION_FOCUS_KEY);

  const bankQuestion = questions[questionIndex];
  const currentQuestionId = bankQuestion?.id;
  const previousQuestionId = useRef(currentQuestionId);
  const seed = seeds[questionIndex] ?? "K";
  const selectedOptionId = answers[questionIndex] ?? null;
  const variant = variants[questionIndex] ?? 1;
  const variantCount = bankQuestion?.numberOfVariants ?? 0;

  const questionAnnexHrefs = useMemo(() => {
    const annexIds = bankQuestion ? getQuestionAnnexIds(bankQuestion) : [];
    return annexes
      .filter((annex) => annexIds.includes(annex.id))
      .map((annex) => annex.href);
  }, [bankQuestion, annexes]);

  const generatedQuestion = useMemo(() => {
    if (!bankQuestion) return null;
    return createTestQuestion({
      id: bankQuestion.id,
      templates: bankQuestion.templates,
      annexes: questionAnnexHrefs,
      seed,
      forcedVariant: variant,
    });
  }, [bankQuestion, questionAnnexHrefs, seed, variant]);

  const rememberedOptionFocus = localOptionFocus ?? storedOptionFocus;
  const hasOptionFocus = rememberedOptionFocus !== null;
  const lastOptionIndex = (generatedQuestion?.options.length ?? 0) - 1;
  const optionNavigationEnabled = !selectedOptionId && lastOptionIndex >= 0;
  const focusedOption =
    rememberedOptionFocus === null || lastOptionIndex < 0
      ? undefined
      : Math.min(rememberedOptionFocus, lastOptionIndex);

  const showQuestionOnMobile = useCallback(() => {
    if (!isDesktop()) setTab("question");
  }, []);

  const onTabChange = useCallback((nextTab: Tab) => {
    setTab(nextTab);
  }, []);

  const toggleExplanation = useCallback(() => {
    setTab((previous) =>
      previous === "question" ? "explanation" : "question",
    );
  }, []);

  const clearAnswer = useCallback(() => {
    setAnswers((previous) => previous.with(questionIndex, null));
    setResults((previous) => previous.with(questionIndex, null));
  }, [questionIndex]);

  const open = useCallback(
    (id: string) => setQuestionIndex(findQuestionIndex(questions, id)),
    [questions],
  );

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;
      setQuestionIndex(index);
    },
    [questions.length],
  );

  const onNavigation = useCallback(
    (target: number | "next" | "previous") => {
      if (typeof target === "number") return goToQuestion(target);
      goToQuestion(questionIndex + (target === "next" ? 1 : -1));
    },
    [goToQuestion, questionIndex],
  );

  const onVariantChange = useCallback(
    (nextVariant: number) => {
      setVariants((previous) => previous.with(questionIndex, nextVariant));
      clearAnswer();
      showQuestionOnMobile();
    },
    [questionIndex, clearAnswer, showQuestionOnMobile],
  );

  const reshuffle = useCallback(
    (nextVariant: number) => {
      const prefix = `${bankQuestion?.id}|`;
      setDrawingsByAnnex((previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(([key]) => !key.startsWith(prefix)),
        ),
      );
      setShakes((previous) => previous + 1);
      setSeeds((previous) => previous.with(questionIndex, getRandomId()));
      setVariants((previous) => previous.with(questionIndex, nextVariant));
      clearAnswer();
      showQuestionOnMobile();
    },
    [bankQuestion, questionIndex, clearAnswer, showQuestionOnMobile],
  );

  const onShuffle = useCallback(() => {
    const randomVariant = 1 + Math.floor(Math.random() * variantCount);
    reshuffle(variantCount > 0 ? randomVariant : 1);
  }, [reshuffle, variantCount]);

  const shuffleNextVariant = useCallback(() => {
    reshuffle(variantCount > 0 ? (variant % variantCount) + 1 : 1);
  }, [reshuffle, variant, variantCount]);

  const onOptionClick = useCallback(
    (optionId: string) => {
      const correct = optionId === generatedQuestion?.correctOptionId;
      setAnswers((previous) => previous.with(questionIndex, optionId));
      setResults((previous) =>
        previous.with(questionIndex, correct ? "correct" : "wrong"),
      );
    },
    [generatedQuestion, questionIndex],
  );

  const selectOptionByIndex = useCallback(
    (index: number) => {
      const option = generatedQuestion?.options[index];
      if (!option || selectedOptionId) return;
      onOptionClick(option.id);
    },
    [generatedQuestion, selectedOptionId, onOptionClick],
  );

  const moveOptionFocus = useCallback(
    (offset: number) => {
      if (lastOptionIndex < 0) return;
      const next =
        focusedOption === undefined
          ? 0
          : Math.max(0, Math.min(lastOptionIndex, focusedOption + offset));
      setLocalOptionFocus(next);
      saveOptionFocus(() => next);
    },
    [focusedOption, lastOptionIndex, saveOptionFocus],
  );

  const selectFocusedOption = useCallback(() => {
    if (focusedOption !== undefined) selectOptionByIndex(focusedOption);
  }, [focusedOption, selectOptionByIndex]);

  const onAnnexClick = useCallback(
    (href: string) => {
      setAnnexHref(href);
      annexModal.open();
    },
    [annexModal.open],
  );

  const onDrawingsChange = useCallback(
    (drawings: Annotation[]) => {
      const key = `${bankQuestion?.id}|${annexHref}`;
      setDrawingsByAnnex((previous) => ({ ...previous, [key]: drawings }));
    },
    [bankQuestion, annexHref],
  );

  useEffect(() => {
    setDrawingsByAnnex({});
    setSeeds(initSeeds(questions));
    setVariants(initVariants(questions));
    setAnswers(initAnswers(questions));
    setResults(initAnswers(questions));
    setQuestionIndex(findQuestionIndex(questions, initialQuestionId));
  }, [questions, initialQuestionId]);

  useEffect(() => {
    annexModal.close();
  }, [questionIndex, annexModal.close]);

  useLayoutEffect(() => {
    const previous = previousQuestionId.current;
    previousQuestionId.current = currentQuestionId;
    if (hasOptionFocus && currentQuestionId && previous !== currentQuestionId) {
      setLocalOptionFocus(0);
      saveOptionFocus(() => 0);
    }
  }, [currentQuestionId, hasOptionFocus, saveOptionFocus]);

  useKeyboardShortcuts(
    enabled && generatedQuestion
      ? {
          r: onShuffle,
          v: shuffleNextVariant,
          i: toggleExplanation,
          "1": () => selectOptionByIndex(0),
          "2": () => selectOptionByIndex(1),
          "3": () => selectOptionByIndex(2),
          "4": () => selectOptionByIndex(3),
          arrowup: optionNavigationEnabled
            ? () => moveOptionFocus(-1)
            : undefined,
          arrowdown: optionNavigationEnabled
            ? () => moveOptionFocus(1)
            : undefined,
          enter:
            optionNavigationEnabled && focusedOption !== undefined
              ? selectFocusedOption
              : undefined,
          arrowleft: () => goToQuestion(questionIndex - 1),
          arrowright: () => goToQuestion(questionIndex + 1),
        }
      : {},
  );

  if (!bankQuestion || !generatedQuestion) {
    return { questionIndex, open, viewer: null };
  }

  const viewer = {
    tab,
    onTabChange,
    onAnnexClick,
    shuffle: { onShuffle, count: shakes },
    navigation: {
      currentQuestionIndex: questionIndex,
      totalQuestions: questions.length,
      statuses: questions.map(
        (_, index) => results[index] ?? ("unanswered" as const),
      ),
      onNavigation,
    },
    information: {
      explanation: generatedQuestion.explanation,
      variants: {
        items: bankQuestion.previews.map((preview, index) => ({
          variant: index + 1,
          question: preview.question,
          correctText: preview.answer,
        })),
        selectedVariant: variant,
        onVariantChange,
      },
    },
    question: {
      title: bankQuestion.id,
      question: generatedQuestion.question,
      options: generatedQuestion.options,
      annexes: generatedQuestion.annexes,
      selectedOptionId: selectedOptionId ?? undefined,
      focusedOptionIndex: focusedOption,
      correctOptionId: generatedQuestion.correctOptionId,
      showResult: Boolean(selectedOptionId),
      disabled: Boolean(selectedOptionId),
      onOptionClick,
      onAnnexClick,
    },
    annexModal: {
      open: annexModal.isOpen,
      onClose: annexModal.close,
    },
    annexViewer: {
      ...parseAnnexHref(annexHref),
      drawings: drawingsByAnnex[`${bankQuestion.id}|${annexHref}`],
      onDrawingsChange,
      onClose: annexModal.close,
    },
  };

  return { questionIndex, open, viewer };
};
