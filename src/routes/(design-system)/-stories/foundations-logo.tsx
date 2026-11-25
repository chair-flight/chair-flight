import { Logo } from "../../../libs/ui/components/base/logo";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const FoundationsLogo: FC = () => (
  <StoryBlock title="Default and large">
    <div className="flex items-center gap-6">
      <Logo />
      <Logo className="size-12" />
    </div>
  </StoryBlock>
);
