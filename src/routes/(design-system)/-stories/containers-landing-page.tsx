import { LandingPage } from "../../../libs/ui/components/containers/landing-page";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const ContainersLandingPage: FC = () => (
  <StoryBlock title="Explore content">
    <LandingPage.ExploreContent text="Explore content" onClick={() => {}} />
  </StoryBlock>
);
