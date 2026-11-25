import { Typical } from "../../../libs/ui/components/elements/typical";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const STEPS = ["Airbus A320", 2000, "Boeing 737", 2000, "ATPL theory", 2000];

export const ElementsTypical: FC = () => (
  <StoryBlock title="Cycling text">
    <p className="m-0 text-2xl font-bold">
      Study for <Typical steps={STEPS} className="text-accent" />
    </p>
  </StoryBlock>
);
