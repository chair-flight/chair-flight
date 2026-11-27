import type {
  QuestionBankIndex,
  QuestionBankLearningObjective,
} from "../content/question-bank-index.ts";

const getAncestors = (
  index: QuestionBankIndex,
  learningObjective: QuestionBankLearningObjective,
): QuestionBankLearningObjective[] => {
  if (!learningObjective.parentId) return [];
  const parent = index.learningObjectivesMap.get(learningObjective.parentId);
  if (!parent) return [];
  return [...getAncestors(index, parent), parent];
};

const getDescendants = (
  childrenByParentId: Map<string, QuestionBankLearningObjective[]>,
  learningObjectiveId: string,
): QuestionBankLearningObjective[] => {
  const children = childrenByParentId.get(learningObjectiveId) ?? [];
  return children.flatMap((child) => [
    child,
    ...getDescendants(childrenByParentId, child.id),
  ]);
};

export const getLearningObjectiveFamily = (
  index: QuestionBankIndex,
  learningObjectiveId: string,
): QuestionBankLearningObjective[] => {
  const learningObjective =
    index.learningObjectivesMap.get(learningObjectiveId);
  if (!learningObjective) return [];

  const childrenByParentId = index.learningObjectives.reduce((groups, item) => {
    if (!item.parentId) return groups;
    groups.set(item.parentId, [...(groups.get(item.parentId) ?? []), item]);
    return groups;
  }, new Map<string, QuestionBankLearningObjective[]>());

  return [
    ...getAncestors(index, learningObjective),
    learningObjective,
    ...getDescendants(childrenByParentId, learningObjectiveId),
  ];
};
