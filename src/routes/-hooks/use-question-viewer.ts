import { useEffect, useMemo, useState } from "react";
import { getRandomId } from "../../libs/base/random";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { createTestQuestion } from "../../libs/core/tests/create-test-question";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { useKeyboardShortcuts } from "../../libs/ui/hooks/use-keyboard-shortcuts";
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

type AnnotationMap = Record<string, Annotation[]>;

export const useQuestionViewer = ({
  question: bankQuestion,
  annexes,
  variant: selectedVariant,
  seed,
  tab,
  onVariantChange,
  onSeedChange,
  onTabChange,
  onAnswerChange,
}: {
  question: QuestionBankQuestion;
  annexes: QuestionBankAnnex[];
  variant: number;
  seed: string;
  tab: Tab;
  onVariantChange?: (variant: number) => void;
  onSeedChange?: (seed: string) => void;
  onTabChange: (tab: Tab) => void;
  onAnswerChange?: (answer: Answer) => void;
}) => {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [shakes, setShakes] = useState(0);
  const [annexHref, setAnnexHref] = useState("");
  const [drawingsByAnnex, setDrawingsByAnnex] = useState<AnnotationMap>({});
  const annexModal = useDisclose();

  const {
    id,
    templates,
    previews,
    numberOfVariants: variantCount,
  } = bankQuestion;

  const questionAnnexHrefs = useMemo(() => {
    const annexIds = getQuestionAnnexIds(bankQuestion);
    return annexes
      .filter((annex) => annexIds.includes(annex.id))
      .map((annex) => annex.href);
  }, [bankQuestion, annexes]);

  const variant = Math.max(1, Math.min(selectedVariant, variantCount));
  const { selectedOptionId } = answers[id] ?? {};

  const generatedQuestion = useMemo(
    () =>
      createTestQuestion({
        id,
        templates,
        annexes: questionAnnexHrefs,
        seed,
        forcedVariant: variant,
      }),
    [id, templates, questionAnnexHrefs, seed, variant],
  );

  const answer = (nextAnswer: Answer) => {
    setAnswers((previous) => ({ ...previous, [id]: nextAnswer }));
    onAnswerChange?.(nextAnswer);
  };

  const clearAnswer = () => {
    answer({ selectedOptionId: undefined, result: undefined });
  };

  const changeVariant = (nextVariant: number) => {
    onVariantChange?.(nextVariant);
    clearAnswer();
  };

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
        Object.entries(previous).filter(([key]) => !key.startsWith(`${id}|`)),
      ),
    );
    setShakes((previous) => previous + 1);
    onSeedChange?.(getRandomId());
    if (variantCount > 0) onVariantChange?.((variant % variantCount) + 1);
    clearAnswer();
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
  });

  useEffect(() => {
    annexModal.close();
  }, [id, annexModal.close]);

  return {
    viewer: {
      tab,
      onTabChange,
      onAnnexClick: openAnnex,
      shuffle: {
        onShuffle: shuffleQuestion,
        count: shakes,
      },
      information: {
        explanation: generatedQuestion.explanation,
        variants: {
          items: previews.map(({ question, answer }, index) => ({
            variant: index + 1,
            question,
            correctText: answer,
          })),
          selectedVariant: variant,
          onVariantChange: selectVariant,
        },
      },
    },
    question: {
      title: id,
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
      drawings: drawingsByAnnex[`${id}|${annexHref}`],
      onDrawingsChange: (drawings: Annotation[]) =>
        setDrawingsByAnnex((previous) => ({
          ...previous,
          [`${id}|${annexHref}`]: drawings,
        })),
      onClose: annexModal.close,
    },
  };
};
