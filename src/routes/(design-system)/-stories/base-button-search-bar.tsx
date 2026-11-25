import { ButtonSearchBar } from "../../../libs/ui/components/base/button-search-bar";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseButtonSearchBar: FC = () => (
  <StoryBlock title="Default">
    <div className="max-w-md">
      <ButtonSearchBar label="Search" />
    </div>
  </StoryBlock>
);
