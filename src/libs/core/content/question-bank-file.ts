import type { QuestionBankName } from "./question-bank-name.ts";
import type { QuestionBankRawAnnex } from "./question-bank-raw-annex.ts";
import type { QuestionBankRawChapter } from "./question-bank-raw-chapter.ts";
import type { QuestionBankRawCourse } from "./question-bank-raw-course.ts";
import type { QuestionBankRawLearningObjective } from "./question-bank-raw-learning-objective.ts";
import type { QuestionBankRawQuestion } from "./question-bank-raw-question.ts";
import type { QuestionBankRawSubject } from "./question-bank-raw-subject.ts";

export type QuestionBankFile = {
  id: QuestionBankName;
  title: string;
  subtitle: string;
  shortTitle: string;
  description: string;
  annexes: QuestionBankRawAnnex[];
  courses: QuestionBankRawCourse[];
  subjects: QuestionBankRawSubject[];
  chapters: QuestionBankRawChapter[];
  learningObjectives: QuestionBankRawLearningObjective[];
  questions: QuestionBankRawQuestion[];
};
