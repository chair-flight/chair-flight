import { useState } from "react";
import { BackgroundForPublic } from "../../../libs/ui/components/backgrounds/background-for-public";
import { Button } from "../../../libs/ui/components/base/button";
import { Public } from "../../../libs/ui/components/containers/public";
import { cn } from "../../../libs/ui/utils/cn";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

const STORY_ENTRIES = [
  {
    id: "subjects",
    label: "Subjects",
    active: true,
    entries: [
      { id: "subject-nav", label: "Navigation" },
      { id: "subject-systems", label: "Systems" },
    ],
  },
  { id: "chapters", label: "Chapters" },
  { id: "learning-objectives", label: "Learning objectives" },
];

const ContainersPublicNavigation: FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <StoryBlock title="Sidebar navigation and mobile menu">
      <div className="flex min-h-72 gap-6 rounded-lg border border-rule p-6">
        <Public.SidebarNav entries={STORY_ENTRIES} />
        <div className="flex flex-1 flex-col items-start gap-3 md:hidden">
          <p className="m-0 text-sm text-muted">
            On small screens the sections open in a bottom sheet.
          </p>
          <Button size="medium" onClick={() => setOpen(true)}>
            Open sections
          </Button>
        </div>
      </div>
      <Public.HamburgerMenu
        open={open}
        entries={STORY_ENTRIES}
        onClose={() => setOpen(false)}
      />
    </StoryBlock>
  );
};

export const ContainersPublic: FC = () => (
  <>
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
    <ContainersPublicNavigation />
  </>
);
