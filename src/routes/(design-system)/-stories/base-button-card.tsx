import { ButtonCard } from "../../../libs/ui/components/base/button-card";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseButtonCard: FC = () => (
  <div className="flex flex-col gap-6">
    <StoryBlock title="Default">
      <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
        {[
          { label: "01", title: "Aircraft general", subtitle: "42 questions" },
          { label: "02", title: "Air systems", subtitle: "18 questions" },
          { label: "03", title: "Anti-ice and rain", subtitle: "7 questions" },
        ].map((chapter) => (
          <ButtonCard
            key={chapter.label}
            {...chapter}
            link={{
              to: "/question-banks/$questionBank/chapters/$chapter",
              params: { questionBank: "b737", chapter: chapter.label },
            }}
          />
        ))}
      </ul>
    </StoryBlock>
  </div>
);
