import { Highlighted } from "../../../libs/ui/components/base/highlighted";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const TEXT = "Checking the hydraulic pressure after the engines are started.";

export const BaseHighlighted: FC = () => (
  <div className="grid gap-6">
    <StoryBlock title="Exact words">
      <p className="m-0 text-sm">
        <Highlighted text={TEXT} words={["hydraulic", "pressure"]} />
      </p>
    </StoryBlock>
    <StoryBlock title="Word endings">
      <p className="m-0 text-sm">
        <Highlighted text={TEXT} words={["checks", "started"]} />
      </p>
    </StoryBlock>
    <StoryBlock title="No words">
      <p className="m-0 text-sm">
        <Highlighted text={TEXT} words={[]} />
      </p>
    </StoryBlock>
  </div>
);
