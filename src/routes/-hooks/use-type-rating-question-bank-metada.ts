export const useTypeRatingQuestionBankMetadata = (metadata: {
  title: string;
  description: string;
  chapters: { id: string; title: string; numberOfQuestions: number }[];
  numberOfQuestions: number;
}) => {
  const chaptersWithQuestions = metadata.chapters.filter(
    (chapter) => chapter.numberOfQuestions > 0,
  );

  const findChapter = (chapterId: string) =>
    metadata.chapters.find((chapter) => chapter.id === chapterId);

  return { ...metadata, chaptersWithQuestions, findChapter };
};
