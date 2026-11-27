import { createLink } from "@tanstack/react-router";
import { ButtonStat } from "../../../libs/ui/components/base/button-stat";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

const ButtonStatLink = createLink(ButtonStat);
const params = { questionBank: "atpl_a", contentId: "021.01" } as const;

export const BaseButtonStat: FC = () => (
  <StoryBlock title="With and without detail">
    <div className="grid max-w-md grid-cols-2 gap-3">
      <ButtonStatLink
        label="Questions"
        value={42}
        detail="86 variants"
        to="/question-banks/$questionBank/content/$contentId/questions"
        params={params}
      />
      <ButtonStatLink
        label="Learning objectives"
        value={12}
        to="/question-banks/$questionBank/content/$contentId/learning-objectives"
        params={params}
      />
      <ButtonStatLink
        label="With figures"
        value={7}
        to="/question-banks/$questionBank/content/$contentId/questions"
        params={params}
        search={{ q: "tags:has-annex" }}
      />
      <ButtonStatLink
        label="With explanations"
        value={31}
        to="/question-banks/$questionBank/content/$contentId/questions"
        params={params}
        search={{ q: "tags:has-explanation" }}
      />
    </div>
  </StoryBlock>
);
