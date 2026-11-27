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

// Turns an annex href written by question templates (`?annotated=` payload and
// `#editable` fragment) into plain props for QuestionAnnexViewer.
export const parseAnnexHref = (href: string) => {
  const [withoutFragment, fragment = ""] = href.split("#");
  const annotated = parseAnnotatedAnnexHref(withoutFragment);
  return {
    href: annotated?.href ?? withoutFragment.split("?")[0],
    width: annotated?.width,
    height: annotated?.height,
    annotations: annotated?.annotations ?? [],
    editable: fragment.split(":").includes("editable"),
  };
};
