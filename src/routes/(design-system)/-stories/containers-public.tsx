import { BackgroundForPublic } from "../../../libs/ui/backgrounds/background-for-public";
import { Public } from "../../../libs/ui/components/containers/public";
import { cn } from "../../../libs/ui/utils/cn";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

export const ContainersPublic: FC = () => (
  <StoryBlock title="Header and footer">
    <div
      className={cn(
        "h-130 overflow-hidden [&>div]:h-full! rounded-lg border border-rule",
        "transform-[translateZ(0)]",
      )}
    >
      <Public>
        <BackgroundForPublic />
        <Public.Header
          showBlogLink
          breadcrumbs={[
            { label: "Blog", link: STORY_LINK },
            { label: "Post title" },
          ]}
          showGithubLink
          showThemeToggle
        />
        <Public.Main>
          <p className="m-0 flex-1 p-6 text-center text-sm text-muted">
            Page content sits here, above the footer.
          </p>
          <Public.Footer />
        </Public.Main>
      </Public>
    </div>
  </StoryBlock>
);
