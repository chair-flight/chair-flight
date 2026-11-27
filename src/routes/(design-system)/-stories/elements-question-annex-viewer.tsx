import { useState } from "react";
import { Checkbox } from "../../../libs/ui/components/base/checkbox";
import { QuestionAnnexViewer } from "../../../libs/ui/components/elements/question-annex-viewer";
import { StoryBlock } from "./story-block";
import type { FC } from "react";
import type { QuestionBankRawQuestionAnnexAnnotation as Annotation } from "../../../libs/core/content/question-bank-raw-question-annex-annotation";

const ANNOTATIONS: Annotation[] = [
  { type: "line", from: [200, 1200], to: [900, 400], dash: "14 9" },
  { type: "circle", x: 900, y: 400, r: 14, fill: "#0d33a6" },
];

export const ElementsQuestionAnnexViewer: FC = () => {
  const [editable, setEditable] = useState(true);
  const [drawings, setDrawings] = useState<Annotation[]>([]);

  return (
    <StoryBlock title="Viewer">
      <div className="flex h-[calc(100dvh-14rem)] min-h-80 flex-col gap-3">
        <label className="flex w-fit items-center gap-2 text-sm text-ink">
          <Checkbox
            checked={editable}
            onChange={(event) => setEditable(event.target.checked)}
          />
          Editable
        </label>
        <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-rule">
          <QuestionAnnexViewer
            href="/content/annexes/atpl_a/APIJ.svg"
            width={1285}
            height={1540}
            editable={editable}
            annotations={ANNOTATIONS}
            drawings={drawings}
            onDrawingsChange={setDrawings}
          />
        </div>
      </div>
    </StoryBlock>
  );
};
