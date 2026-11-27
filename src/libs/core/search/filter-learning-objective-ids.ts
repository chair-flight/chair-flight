type FilterableLearningObjective = {
  id: string;
  parentId: string | null;
  text: string;
};

export const filterLearningObjectiveIds = (
  items: FilterableLearningObjective[],
  query: string,
) => {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return undefined;
  const parentIds = tokens
    .filter((token) => token.startsWith("parent:"))
    .map((token) => token.slice("parent:".length));
  const words = tokens.filter((token) => !token.startsWith("parent:"));
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const childIdsByParentId = items.reduce((groups, item) => {
    if (!item.parentId) return groups;
    groups.set(item.parentId, [...(groups.get(item.parentId) ?? []), item.id]);
    return groups;
  }, new Map<string, string[]>());
  const visibleIds = new Set<string>();
  const addAncestors = (parentId: string | null) => {
    if (!parentId || !itemsById.has(parentId) || visibleIds.has(parentId)) {
      return;
    }
    visibleIds.add(parentId);
    addAncestors(itemsById.get(parentId)?.parentId ?? null);
  };
  const addDescendants = (id: string) => {
    visibleIds.add(id);
    for (const childId of childIdsByParentId.get(id) ?? []) {
      addDescendants(childId);
    }
  };
  for (const item of items) {
    const itemId = item.id.toLowerCase();
    const inScope =
      parentIds.length === 0 ||
      parentIds.some((id) => itemId === id || itemId.startsWith(`${id}.`));
    if (!inScope) continue;
    const haystack = `${item.id} ${item.text}`.toLowerCase();
    if (!words.every((word) => haystack.includes(word))) continue;
    addDescendants(item.id);
    addAncestors(item.parentId);
  }
  return Array.from(visibleIds);
};
