import { getEasaModuleOverview } from "./get-easa-module-overview.ts";
import type {
  QuestionBankIndex,
  QuestionBankLearningObjective,
} from "../content/question-bank-index.ts";
import type { QuestionBankName } from "../content/question-bank-name.ts";

type Chapter = {
  id: string;
  label: string;
  title: string;
  numberOfQuestions: number;
  chapters?: Chapter[];
};

export const getChapterSelection = (
  questionBank: QuestionBankName,
  index: QuestionBankIndex,
  learningObjectives: QuestionBankLearningObjective[],
): Chapter[] => {
  if (questionBank === "a320" || questionBank === "b737") {
    return index.chapters.map((chapter) => ({
      id: chapter.id,
      label: chapter.id,
      title: chapter.title,
      numberOfQuestions: index.questions.filter(
        (question) => question.chapterId === chapter.id,
      ).length,
    }));
  }

  const overview = getEasaModuleOverview(index, learningObjectives, 2);
  if (questionBank === "ppl_a") {
    return overview.subjects.map((subject) => ({
      id: subject.id,
      label: subject.id,
      title: subject.longName,
      numberOfQuestions: index.questions.filter(
        (question) => question.subjectId === subject.id,
      ).length,
    }));
  }

  return overview.subjects
    .filter((subject) => subject.chapters.length > 0)
    .map((subject) => ({
      id: subject.id,
      label: subject.id,
      title: subject.longName,
      numberOfQuestions: subject.chapters.reduce(
        (total, chapter) => total + chapter.numberOfQuestions,
        0,
      ),
      chapters: subject.chapters.map((chapter) => ({
        id: chapter.id,
        label: chapter.id.split(".").slice(1).join("."),
        title: chapter.name,
        numberOfQuestions: chapter.numberOfQuestions,
      })),
    }));
};
