export const QUESTION_BANK_NAMES = ["atpl_a", "ppl_a", "b737", "a320"] as const;

export type QuestionBankName = (typeof QUESTION_BANK_NAMES)[number];
