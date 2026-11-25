import { ThemeToggle } from "../../../libs/ui/components/base/theme-toggle";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseThemeToggle: FC = () => (
  <StoryBlock title="Light and dark">
    <ThemeToggle />
  </StoryBlock>
);
