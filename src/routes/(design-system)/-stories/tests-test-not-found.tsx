import { TestNotFound } from "../../../libs/ui/components/tests/test-not-found";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const TestsTestNotFound: FC = () => (
  <StoryBlock title="Default">
    <div className="h-[360px] overflow-hidden rounded-lg border border-rule">
      <TestNotFound />
    </div>
  </StoryBlock>
);
