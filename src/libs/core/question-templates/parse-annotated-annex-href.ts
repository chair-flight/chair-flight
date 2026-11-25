import type { QuestionBankRawQuestionTemplate } from "../content/question-bank-raw-question-template.ts";

type Annotation = NonNullable<
  Extract<QuestionBankRawQuestionTemplate, { type: "simple" }>["annexes"]
>[string]["annotations"][number];

export const parseAnnotatedAnnexHref = (
  href: string,
): {
  href: string;
  width?: number;
  height?: number;
  annotations: Annotation[];
} | null => {
  const [path, query = ""] = href.split("?");
  const payload = new URLSearchParams(query).get("annotated");
  if (!path || !payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return {
      href: path,
      width: typeof parsed.width === "number" ? parsed.width : undefined,
      height: typeof parsed.height === "number" ? parsed.height : undefined,
      annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [],
    };
  } catch {
    return null;
  }
};
