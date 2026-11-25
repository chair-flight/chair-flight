import { Button } from "../../../libs/ui/components/base/button";
import { PlayIcon } from "../../../libs/ui/icons/play-icon";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseButtons: FC = () => (
  <div className="flex max-w-xl flex-col gap-8">
    <StoryBlock title="Variants">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="success">Success</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="warning">Warning</Button>
      </div>
    </StoryBlock>
    <StoryBlock title="Disabled">
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled>Default</Button>
        <Button variant="primary" disabled>
          Primary
        </Button>
        <Button variant="danger" disabled>
          Danger
        </Button>
      </div>
    </StoryBlock>
    <StoryBlock title="Sizes">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large" variant="primary">
          <PlayIcon size={20} />
          Large
        </Button>
      </div>
    </StoryBlock>
  </div>
);
