import type { QuestionBankName } from "./question-bank-name.ts";
import type { QuestionBankRawAnnex } from "./question-bank-raw-annex.ts";
import type { QuestionBankRawChapter } from "./question-bank-raw-chapter.ts";
import type { QuestionBankRawCourse } from "./question-bank-raw-course.ts";
import type { QuestionBankRawLearningObjective } from "./question-bank-raw-learning-objective.ts";
import type { QuestionBankRawQuestion } from "./question-bank-raw-question.ts";
import type { QuestionBankRawSubject } from "./question-bank-raw-subject.ts";

export type QuestionBankSubject = QuestionBankRawSubject;
export type QuestionBankChapter = QuestionBankRawChapter;
export type QuestionBankLearningObjective = QuestionBankRawLearningObjective;

export type QuestionBankAnnex = QuestionBankRawAnnex & {
  href: string;
};

export type QuestionBankQuestion = QuestionBankRawQuestion & {
  numberOfVariants: number;
  previews: {
    question: string;
    answer: string;
  }[];
};

export type QuestionBankIndex = {
  id: QuestionBankName;
  title: string;
  subtitle: string;
  shortTitle: string;
  description: string;
  annexes: QuestionBankAnnex[];
  courses: QuestionBankRawCourse[];
  subjects: QuestionBankSubject[];
  chapters: QuestionBankChapter[];
  learningObjectives: QuestionBankLearningObjective[];
  questions: QuestionBankQuestion[];
  annexesMap: Map<string, QuestionBankAnnex>;
  subjectsMap: Map<string, QuestionBankSubject>;
  chaptersMap: Map<string, QuestionBankChapter>;
  learningObjectivesMap: Map<string, QuestionBankLearningObjective>;
  questionsMap: Map<string, QuestionBankQuestion>;
};
