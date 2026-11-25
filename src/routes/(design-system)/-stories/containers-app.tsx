import { Breadcrumbs } from "../../../libs/ui/components/base/breadcrumbs";
import { App } from "../../../libs/ui/components/containers/app";
import { BookIcon } from "../../../libs/ui/icons/book-icon";
import { HelpIcon } from "../../../libs/ui/icons/help-icon";
import { PlayIcon } from "../../../libs/ui/icons/play-icon";
import { cn } from "../../../libs/ui/utils/cn";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

export const ContainersApp: FC = () => (
  <>
    <StoryBlock title="Default">
      <div
        className={cn(
          "h-[520px] overflow-hidden [&>div]:h-full! rounded-lg border border-rule",
          "[transform:translateZ(0)]",
        )}
      >
        <App
          sidebar={[
            { icon: BookIcon, label: "Home", link: { to: "/" }, exact: true },
            { icon: HelpIcon, label: "Questions", link: STORY_LINK },
            { icon: PlayIcon, label: "Tests", link: STORY_LINK },
            { icon: BookIcon, label: "Student notes", link: STORY_LINK },
          ]}
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "ATPL", link: STORY_LINK },
                { label: "Questions", link: STORY_LINK },
                { label: "QDS1" },
              ]}
            />
          }
        >
          <p className="m-0 p-6 text-center text-sm text-muted">
            Page content scrolls here. Collapse the sidebar with the button at
            the bottom; on a phone it becomes an overlay opened from the header.
          </p>
        </App>
      </div>
    </StoryBlock>
  </>
);
