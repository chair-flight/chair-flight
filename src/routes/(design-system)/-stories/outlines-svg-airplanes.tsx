import { AirplaneAirbus320 } from "../../../libs/ui/components/outlines/airplane-airbus-320";
import { AirplaneBoeing737 } from "../../../libs/ui/components/outlines/airplane-boeing-737";
import { AirplaneCessna172 } from "../../../libs/ui/components/outlines/airplane-cessna-172";
import { AirplaneTecnamP2006t } from "../../../libs/ui/components/outlines/airplane-tecnam-p2006t";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const OutlinesSvgAirplanes: FC = () => (
  <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
    <StoryBlock title="Airbus A320-200">
      <AirplaneAirbus320 className="w-full text-accent" />
    </StoryBlock>
    <StoryBlock title="Boeing 737-800">
      <AirplaneBoeing737 className="w-full text-accent" />
    </StoryBlock>
    <StoryBlock title="Cessna 172">
      <AirplaneCessna172 className="w-full text-accent" />
    </StoryBlock>
    <StoryBlock title="Tecnam P2006T">
      <AirplaneTecnamP2006t className="w-full text-accent" />
    </StoryBlock>
  </div>
);
