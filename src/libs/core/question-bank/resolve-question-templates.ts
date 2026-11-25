import type { QuestionBankRawQuestion } from "../content/question-bank-raw-question.ts";

export const ANNEX_REFERENCE =
  /(\]\()annex:(?!\{\{)([^)?}\s:]*)((?::(?:sm|md|lg|editable))*)/g;

export const resolveQuestionTemplates = (
  question: QuestionBankRawQuestion,
  annexHrefs: Map<string, string>,
) => {
  const localAnnexes = Object.fromEntries(
    question.annexes.flatMap((annex) => {
      if (!("base" in annex)) return [];
      return [
        [
          annex.id,
          {
            annex: annex.base,
            width: annex.width,
            height: annex.height,
            annotations: annex.annotations,
          },
        ] as const,
      ];
    }),
  );
  const localAnnexNames = new Set(Object.keys(localAnnexes));
  const resolvedTemplates = question.templates.map((template) =>
    template.type === "simple" && localAnnexNames.size > 0
      ? { ...template, annexes: localAnnexes }
      : template.type === "definition" &&
          template.question.includes("annex:{{term}}")
        ? {
            ...template,
            options: template.options.map((option) => ({
              ...option,
              term: annexHrefs.get(option.term) ?? option.term,
            })),
          }
        : template,
  );
  return JSON.parse(JSON.stringify(resolvedTemplates), (key, value) => {
    if (typeof value !== "string") return value;
    if (key === "annex" && value) return annexHrefs.get(value);
    return value.replaceAll(
      ANNEX_REFERENCE,
      (match: string, prefix: string, id: string, modifiers: string) => {
        if (localAnnexNames.has(id)) return match;
        const href = annexHrefs.get(id);
        if (!href) throw new Error(`${question.id} uses missing annex ${id}.`);
        const sizedHref = modifiers ? `${href}#${modifiers.slice(1)}` : href;
        return `${prefix}${sizedHref}`;
      },
    );
  }) as QuestionBankRawQuestion["templates"];
};
