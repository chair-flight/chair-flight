import { GraphicPropeller } from "../../../libs/ui/components/outlines/graphic-propeller";
import { GraphicTurbofan } from "../../../libs/ui/components/outlines/graphic-turbofan";
import { GraphicWing } from "../../../libs/ui/components/outlines/graphic-wing";
import { GraphicYoke } from "../../../libs/ui/components/outlines/graphic-yoke";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const OutlinesSvgGraphics: FC = () => (
  <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
    <StoryBlock title="Turbofan">
      <GraphicTurbofan className="w-full text-accent" />
    </StoryBlock>
    <StoryBlock title="Propeller">
      <GraphicPropeller className="w-full text-accent" />
    </StoryBlock>
    <StoryBlock title="Wing">
      <GraphicWing className="w-full text-accent" />
    </StoryBlock>
    <StoryBlock title="Yoke">
      <GraphicYoke className="w-full text-accent" />
    </StoryBlock>
  </div>
);
