import { getLearningObjectiveQuestionCounts } from "./get-learning-objective-question-counts.ts";
import type {
  QuestionBankIndex,
  QuestionBankLearningObjective,
} from "../content/question-bank-index.ts";

export const getEasaModuleOverview = (
  index: QuestionBankIndex,
  learningObjectives: QuestionBankLearningObjective[],
  chapterDepth: number,
) => {
  const questionCounts = getLearningObjectiveQuestionCounts(
    index,
    learningObjectives,
  );
  const rows = learningObjectives
    .filter((item) => {
      const depth = item.id.split(".").length;
      return depth >= 2 && depth <= chapterDepth + 1;
    })
    .map((item) => ({
      id: item.id,
      subject: item.subject,
      text: item.text,
      numberOfQuestions: questionCounts[item.id] ?? 0,
    }))
    .toSorted((a, b) => (a.id < b.id ? -1 : 1));

  return {
    title: index.title,
    description: index.description,
    courses: index.courses,
    subjects: index.subjects.map(({ exams, ...subject }) => {
      const subjectRows = rows.filter(
        (row) => row.subject === subject.id && row.numberOfQuestions > 0,
      );
      return {
        ...subject,
        numberOfExamQuestions: exams[0]?.questions ?? 0,
        numberOfExamMinutes: exams[0]?.minutes ?? 0,
        numberOfQuestions:
          subjectRows.find((row) => row.id === subject.id)?.numberOfQuestions ??
          0,
        chapters: subjectRows
          .filter((row) => row.id.split(".").length === chapterDepth)
          .map((chapter) => ({
            ...chapter,
            name: index.chaptersMap.get(chapter.id)?.title ?? chapter.text,
            sections: subjectRows.filter(
              (row) =>
                row.id.split(".").length === chapterDepth + 1 &&
                row.id.startsWith(`${chapter.id}.`),
            ),
          })),
      };
    }),
  };
};
