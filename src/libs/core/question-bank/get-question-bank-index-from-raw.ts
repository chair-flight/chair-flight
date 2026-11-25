import { generateQuestionPreviews } from "../question-templates/generate-question-previews.ts";
import { resolveQuestionTemplates } from "./resolve-question-templates.ts";
import type { QuestionBankFile } from "../content/question-bank-file.ts";
import type { QuestionBankIndex } from "../content/question-bank-index.ts";

export const getQuestionBankIndexFromRaw = (
  file: QuestionBankFile,
): QuestionBankIndex => {
  const annexes = file.annexes.map((annex) => ({
    ...annex,
    href: `/content/annexes/${file.id}/${annex.id}.${annex.format}`,
  }));
  const annexHrefs = new Map(annexes.map((a) => [a.id, a.href]));
  const questions = file.questions.map((question) => {
    const templates = resolveQuestionTemplates(question, annexHrefs);
    const previews = generateQuestionPreviews(templates);
    return {
      ...question,
      templates,
      numberOfVariants: previews.length,
      previews,
    };
  });
  return {
    ...file,
    annexes,
    questions,
    annexesMap: new Map(annexes.map((i) => [i.id, i])),
    subjectsMap: new Map(file.subjects.map((i) => [i.id, i])),
    chaptersMap: new Map(file.chapters.map((i) => [i.id, i])),
    learningObjectivesMap: new Map(
      file.learningObjectives.map((i) => [i.id, i]),
    ),
    questionsMap: new Map(questions.map((i) => [i.id, i])),
  };
};
