import { useEffect, useMemo, useState } from "react";
import { getRandomId } from "../../libs/base/random";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { createTestQuestion } from "../../libs/core/tests/create-test-question";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { useKeyboardShortcuts } from "../../libs/ui/hooks/use-keyboard-shortcuts";
import { useLocalStorage } from "../../libs/ui/hooks/use-local-storage";
import type {
  QuestionBankAnnex,
  QuestionBankQuestion,
} from "../../libs/core/content/question-bank-index";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../libs/core/content/question-bank-raw-question-annex-annotation";

type Tab = "question" | "explanation" | "variants";

type Answer = {
  selectedOptionId?: string;
  result?: "correct" | "wrong";
};

type StoredStudySession = {
  id: string;
  questionIndex: number;
  variants: Record<string, number>;
  seeds: Record<string, string>;
  answers: Record<string, Answer>;
};

type AnnotationMap = Record<string, Annotation[]>;

const STORAGE_KEY = "chair-flight-study-session";

export const useStudySession = ({
  id,
  questions,
  annexes,
  tab,
  onTabChange,
}: {
  id: string;
  questions: QuestionBankQuestion[];
  annexes: QuestionBankAnnex[];
  tab: Tab;
  onTabChange: (tab: Tab) => void;
}) => {
  const { value, update } = useLocalStorage<StoredStudySession>(STORAGE_KEY);
  const [shakes, setShakes] = useState(0);
  const [annexHref, setAnnexHref] = useState("");
  const [drawingsByAnnex, setDrawingsByAnnex] = useState<AnnotationMap>({});
  const annexModal = useDisclose();

  const stored: StoredStudySession =
    value?.id === id
      ? value
      : { id, questionIndex: 0, variants: {}, seeds: {}, answers: {} };
  const questionIndex = Math.min(
    Math.max(stored.questionIndex, 0),
    Math.max(questions.length - 1, 0),
  );
  const bankQuestion = questions[questionIndex];
  const questionId = bankQuestion?.id ?? "";
  const templates = useMemo(
    () => bankQuestion?.templates ?? [],
    [bankQuestion],
  );
  const seed = stored.seeds[questionId] ?? questionId;
  const selectedVariant = stored.variants[questionId] ?? 1;
  const { selectedOptionId } = stored.answers[questionId] ?? {};

  const questionAnnexHrefs = useMemo(() => {
    const annexIds = bankQuestion ? getQuestionAnnexIds(bankQuestion) : [];
    return annexes
      .filter((annex) => annexIds.includes(annex.id))
      .map((annex) => annex.href);
  }, [bankQuestion, annexes]);

  const variantCount = bankQuestion?.numberOfVariants ?? 0;
  const variant = Math.max(1, Math.min(selectedVariant, variantCount));

  const variantPreviews = useMemo(
    () =>
      (bankQuestion?.previews ?? []).map(({ question, answer }, index) => ({
        variant: index + 1,
        question,
        correctText: answer,
      })),
    [bankQuestion],
  );

  const generatedQuestion = useMemo(
    () =>
      createTestQuestion({
        id: questionId,
        templates,
        annexes: questionAnnexHrefs,
        seed,
        forcedVariant: variant,
      }),
    [questionId, templates, questionAnnexHrefs, seed, variant],
  );

  useEffect(() => {
    annexModal.close();
  }, [questionId, annexModal.close]);

  const updateSession = (
    updater: (previous: StoredStudySession) => StoredStudySession,
  ) =>
    update((previous) =>
      updater(
        previous?.id === id
          ? previous
          : { id, questionIndex: 0, variants: {}, seeds: {}, answers: {} },
      ),
    );

  const answer = (nextAnswer: Answer) =>
    updateSession((previous) => ({
      ...previous,
      answers: { ...previous.answers, [questionId]: nextAnswer },
    }));

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;
    updateSession((previous) => ({ ...previous, questionIndex: index }));
  };

  const changeVariant = (nextVariant: number) =>
    updateSession((previous) => ({
      ...previous,
      variants: { ...previous.variants, [questionId]: nextVariant },
      answers: { ...previous.answers, [questionId]: {} },
    }));

  const selectVariant = (nextVariant: number) => {
    changeVariant(nextVariant);
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      onTabChange("question");
    }
  };

  const stepVariant = (offset: number) => {
    const nextVariant = variant + offset;
    if (nextVariant < 1 || nextVariant > variantCount) return;
    changeVariant(nextVariant);
  };

  const shuffleQuestion = () => {
    setDrawingsByAnnex((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(
          ([key]) => !key.startsWith(`${questionId}|`),
        ),
      ),
    );
    setShakes((previous) => previous + 1);
    updateSession((previous) => ({
      ...previous,
      seeds: { ...previous.seeds, [questionId]: getRandomId() },
      variants: {
        ...previous.variants,
        [questionId]: variantCount > 0 ? (variant % variantCount) + 1 : 1,
      },
      answers: { ...previous.answers, [questionId]: {} },
    }));
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      onTabChange("question");
    }
  };

  const selectOption = (optionId: string) => {
    const correct = optionId === generatedQuestion.correctOptionId;
    answer({
      selectedOptionId: optionId,
      result: correct ? "correct" : "wrong",
    });
  };

  const selectOptionByIndex = (index: number) => {
    const option = generatedQuestion.options[index];
    if (!option || selectedOptionId) return;
    selectOption(option.id);
  };

  const openAnnex = (href: string) => {
    setAnnexHref(href);
    annexModal.open();
  };

  useKeyboardShortcuts({
    r: shuffleQuestion,
    i: () => onTabChange(tab === "question" ? "explanation" : "question"),
    "1": () => selectOptionByIndex(0),
    "2": () => selectOptionByIndex(1),
    "3": () => selectOptionByIndex(2),
    "4": () => selectOptionByIndex(3),
    arrowup: () => stepVariant(-1),
    arrowdown: () => stepVariant(1),
    arrowleft: () => goToQuestion(questionIndex - 1),
    arrowright: () => goToQuestion(questionIndex + 1),
  });

  return {
    questionIndex,
    viewer: {
      tab,
      onTabChange,
      onAnnexClick: openAnnex,
      shuffle: {
        onShuffle: shuffleQuestion,
        count: shakes,
      },
      navigation: {
        currentQuestionIndex: questionIndex,
        totalQuestions: questions.length,
        statuses: questions.map(
          (question) => stored.answers[question.id]?.result ?? "unanswered",
        ),
        onNavigation: (target: number | "next" | "previous") =>
          goToQuestion(
            typeof target === "number"
              ? target
              : questionIndex + (target === "next" ? 1 : -1),
          ),
      },
      information: {
        explanation: generatedQuestion.explanation,
        variants: {
          items: variantPreviews,
          selectedVariant: variant,
          onVariantChange: selectVariant,
        },
      },
    },
    question: {
      title: questionId,
      question: generatedQuestion.question,
      options: generatedQuestion.options,
      annexes: generatedQuestion.annexes,
      selectedOptionId,
      correctOptionId: generatedQuestion.correctOptionId,
      showResult: Boolean(selectedOptionId),
      disabled: Boolean(selectedOptionId),
      onOptionClick: selectOption,
      onAnnexClick: openAnnex,
    },
    annexModal: {
      open: annexModal.isOpen,
      onClose: annexModal.close,
    },
    annexViewer: {
      href: annexHref,
      drawings: drawingsByAnnex[`${questionId}|${annexHref}`],
      onDrawingsChange: (drawings: Annotation[]) =>
        setDrawingsByAnnex((previous) => ({
          ...previous,
          [`${questionId}|${annexHref}`]: drawings,
        })),
      onClose: annexModal.close,
    },
  };
};
