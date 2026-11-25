import { buildAnnotatedAnnexHref } from "./build-annotated-annex-href.ts";

const MACRO_MATCH = /\{\{\s*([^{}]+?)\s*\}\}/g;
const LOCAL_ANNEX_MATCH =
  /(\]\()annex:([^)}\s:]+)((?::(?:sm|md|lg|editable))*)/g;

export const fillTemplate = (
  text: string,
  context: {
    variables?: Record<string, string | number>;
    annexes?: Record<
      string,
      {
        annex: string;
        width?: number;
        height?: number;
        annotations: { type: string; text?: string }[];
      }
    >;
    wrongAnswersTable?: string;
  },
) => {
  const variables = context.variables ?? {};
  const readVariable = (name: string) => {
    const value = variables[name];
    if (value === undefined) throw new Error(`Unknown variable "${name}".`);
    return String(value);
  };
  const fillVariables = (value: string): string =>
    value.replace(MACRO_MATCH, (_, name: string) => readVariable(name));
  const withLocalAnnexes = text.replace(
    LOCAL_ANNEX_MATCH,
    (match, prefix: string, name: string, modifiers: string) => {
      const localAnnex = context.annexes?.[name];
      if (!localAnnex) return match;
      const href = buildAnnotatedAnnexHref({
        href: localAnnex.annex,
        width: localAnnex.width,
        height: localAnnex.height,
        annotations: localAnnex.annotations.map((annotation) =>
          annotation.text === undefined
            ? annotation
            : { ...annotation, text: fillVariables(annotation.text) },
        ),
      });
      const sizedHref = modifiers ? `${href}#${modifiers.slice(1)}` : href;
      return `${prefix}${sizedHref}`;
    },
  );
  return withLocalAnnexes.replace(MACRO_MATCH, (_, macro: string) => {
    if (macro === "wrong-answers-table") return context.wrongAnswersTable ?? "";
    return readVariable(macro);
  });
};
