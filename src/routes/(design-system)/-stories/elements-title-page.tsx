import { TitlePage } from "../../../libs/ui/components/elements/title-page";
import { STORY_LINK, StoryBlock } from "./story-block";
import type { FC } from "react";

export const ElementsTitlePage: FC = () => (
  <div className="flex max-w-3xl flex-col gap-6">
    <StoryBlock title="Large">
      <div className="rounded-lg border border-rule p-4">
        <TitlePage
          size="large"
          parent={{ label: "Air Law", link: STORY_LINK }}
          caption="010.11"
          title="Search and rescue (SAR)"
        />
      </div>
    </StoryBlock>
    <StoryBlock title="Medium">
      <div className="rounded-lg border border-rule p-4">
        <TitlePage
          size="medium"
          parent={{ label: "Air Law", link: STORY_LINK }}
          caption="010.01.01.02.02"
          title="General principles - Describe the application of the following terms in civil aviation:"
          items={[
            "sovereignty",
            "territory and high seas according to the UN Convention on the High Seas",
          ]}
        />
      </div>
    </StoryBlock>
  </div>
);
