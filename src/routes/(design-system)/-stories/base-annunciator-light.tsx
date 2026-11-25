import { AnnunciatorLight } from "../../../libs/ui/components/base/annunciator-light";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseAnnunciatorLight: FC = () => (
  <StoryBlock title="Colours" note="One or two lines, split with a slash.">
    <div className="flex flex-wrap items-center gap-4">
      <AnnunciatorLight label="LOW PRESSURE" colour="amber" />
      <AnnunciatorLight label="LOW/PRESSURE" colour="amber" />
      <AnnunciatorLight label="RF" colour="white" />
      <AnnunciatorLight label="FIRE" colour="red" />
      <AnnunciatorLight label="ON" colour="green" />
      <AnnunciatorLight label="ARM" colour="blue" />
    </div>
  </StoryBlock>
);
