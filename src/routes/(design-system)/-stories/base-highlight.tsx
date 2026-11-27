import { Highlight } from "../../../libs/ui/components/base/highlight";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const TEXT = "Checking the hydraulic pressure after the engines are started.";

export const BaseHighlight: FC = () => (
  <div className="grid gap-6">
    <StoryBlock title="Exact words">
      <p className="m-0 text-sm">
        <Highlight highlight={["hydraulic", "pressure"]}>{TEXT}</Highlight>
      </p>
    </StoryBlock>
    <StoryBlock title="Text query">
      <p className="m-0 text-sm">
        <Highlight highlight="engines started">{TEXT}</Highlight>
      </p>
    </StoryBlock>
    <StoryBlock title="Word endings">
      <p className="m-0 text-sm">
        <Highlight highlight={["checks", "started"]}>{TEXT}</Highlight>
      </p>
    </StoryBlock>
    <StoryBlock title="No words">
      <p className="m-0 text-sm">
        <Highlight highlight={[]}>{TEXT}</Highlight>
      </p>
    </StoryBlock>
  </div>
);
