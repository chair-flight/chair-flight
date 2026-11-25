import { getQuestionBankIndexFromRaw } from "../core/question-bank/get-question-bank-index-from-raw.ts";
import type { QuestionBankFile } from "../core/content/question-bank-file.ts";
import type { QuestionBankIndex } from "../core/content/question-bank-index.ts";
import type { QuestionBankName } from "../core/content/question-bank-name.ts";

const INDEXES = import.meta.glob<QuestionBankFile>(
  "/generated/question-banks/*/index.json",
  { import: "default" },
);

class QuestionBankDb {
  private readonly questionBanks = new Map<
    QuestionBankName,
    Promise<QuestionBankIndex>
  >();

  public getQuestionBank(questionBank: QuestionBankName) {
    const cached = this.questionBanks.get(questionBank);
    if (cached) return cached;

    const file = `/generated/question-banks/${questionBank}/index.json`;
    const loader = INDEXES[file];
    if (!loader) throw new Error(`Missing generated content ${file}.`);

    const loaded = loader().then(getQuestionBankIndexFromRaw);
    this.questionBanks.set(questionBank, loaded);
    return loaded;
  }
}

const instance = new QuestionBankDb();

export const getQuestionBankDb = () => instance;
