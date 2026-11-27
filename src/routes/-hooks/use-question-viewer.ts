import { useCallback, useEffect, useMemo, useState } from "react";
import { getRandomId } from "../../libs/base/random";
import { getQuestionAnnexIds } from "../../libs/core/question-bank/get-question-annex-ids";
import { parseAnnexHref } from "../../libs/core/question-templates/parse-annotated-annex-href";
import { createTestQuestion } from "../../libs/core/tests/create-test-question";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { useKeyboardShortcuts } from "../../libs/ui/hooks/use-keyboard-shortcuts";
import type {
  QuestionBankAnnex,
  QuestionBankQuestion,
} from "../../libs/core/content/question-bank-index";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../libs/core/content/question-bank-raw-question-annex-annotation";

type Tab = "question" | "explanation";

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

export const useQuestionViewer = ({
  question: bankQuestion,
  annexes,
  variant: selectedVariant,
  seed,
  onVariantChange,
  onSeedChange,
}: {
  question: QuestionBankQuestion;
  annexes: QuestionBankAnnex[];
  variant: number;
  seed: string;
  onVariantChange: (variant: number) => void;
  onSeedChange: (seed: string) => void;
}) => {
  const annexModal = useDisclose();
  const [tab, setTab] = useState<Tab>("question");
  const [shakes, setShakes] = useState(0);
  const [annexHref, setAnnexHref] = useState("");
  const [drawingsByAnnex, setDrawingsByAnnex] = useState<
    Record<string, Annotation[]>
  >({});
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

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

  const showQuestionOnMobile = useCallback(() => {
    if (!isDesktop()) setTab("question");
  }, []);

  const onTabChange = useCallback((nextTab: Tab) => setTab(nextTab), []);

  const toggleExplanation = useCallback(() => {
    setTab((previous) =>
      previous === "question" ? "explanation" : "question",
    );
  }, []);

  const changeVariant = useCallback(
    (nextVariant: number) => {
      onVariantChange(nextVariant);
      setSelectedOptionId(null);
    },
    [onVariantChange],
  );

  const onVariantSelect = useCallback(
    (nextVariant: number) => {
      changeVariant(nextVariant);
      showQuestionOnMobile();
    },
    [changeVariant, showQuestionOnMobile],
  );

  const stepVariant = useCallback(
    (offset: number) => {
      const nextVariant = variant + offset;
      if (nextVariant < 1 || nextVariant > variantCount) return;
      changeVariant(nextVariant);
    },
    [variant, variantCount, changeVariant],
  );

  const onShuffle = useCallback(() => {
    const prefix = `${id}|`;
    setDrawingsByAnnex((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(([key]) => !key.startsWith(prefix)),
      ),
    );
    setShakes((previous) => previous + 1);
    onSeedChange(getRandomId());
    if (variantCount > 0) onVariantChange((variant % variantCount) + 1);
    setSelectedOptionId(null);
    showQuestionOnMobile();
  }, [
    id,
    variant,
    variantCount,
    onSeedChange,
    onVariantChange,
    showQuestionOnMobile,
  ]);

  const onOptionClick = useCallback(
    (optionId: string) => setSelectedOptionId(optionId),
    [],
  );

  const selectOptionByIndex = useCallback(
    (index: number) => {
      const option = generatedQuestion.options[index];
      if (!option || selectedOptionId) return;
      setSelectedOptionId(option.id);
    },
    [generatedQuestion, selectedOptionId],
  );

  const onAnnexClick = useCallback(
    (href: string) => {
      setAnnexHref(href);
      annexModal.open();
    },
    [annexModal.open],
  );

  const onDrawingsChange = useCallback(
    (drawings: Annotation[]) => {
      const key = `${id}|${annexHref}`;
      setDrawingsByAnnex((previous) => ({ ...previous, [key]: drawings }));
    },
    [id, annexHref],
  );

  const shortcuts = useMemo(
    () => ({
      r: onShuffle,
      i: toggleExplanation,
      "1": () => selectOptionByIndex(0),
      "2": () => selectOptionByIndex(1),
      "3": () => selectOptionByIndex(2),
      "4": () => selectOptionByIndex(3),
      arrowup: () => stepVariant(-1),
      arrowdown: () => stepVariant(1),
    }),
    [onShuffle, toggleExplanation, selectOptionByIndex, stepVariant],
  );

  useEffect(() => {
    annexModal.close();
    setSelectedOptionId(null);
  }, [id, annexModal.close]);

  useKeyboardShortcuts(shortcuts);

  return {
    viewer: {
      tab,
      onTabChange,
      onAnnexClick,
      shuffle: { onShuffle, count: shakes },
      information: {
        explanation: generatedQuestion.explanation,
        variants: {
          items: previews.map((preview, index) => ({
            variant: index + 1,
            question: preview.question,
            correctText: preview.answer,
          })),
          selectedVariant: variant,
          onVariantChange: onVariantSelect,
        },
      },
      question: {
        title: id,
        question: generatedQuestion.question,
        options: generatedQuestion.options,
        annexes: generatedQuestion.annexes,
        selectedOptionId: selectedOptionId ?? undefined,
        correctOptionId: generatedQuestion.correctOptionId,
        showResult: Boolean(selectedOptionId),
        disabled: Boolean(selectedOptionId),
        onOptionClick,
        onAnnexClick,
      },
      annexModal: { open: annexModal.isOpen, onClose: annexModal.close },
      annexViewer: {
        ...parseAnnexHref(annexHref),
        drawings: drawingsByAnnex[`${id}|${annexHref}`],
        onDrawingsChange,
        onClose: annexModal.close,
      },
    },
  };
};
