import { ButtonIcon } from "../../../libs/ui/components/base/button-icon";
import { Tooltip } from "../../../libs/ui/components/base/tooltip";
import { EyeIcon } from "../../../libs/ui/components/icons/eye-icon";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseTooltip: FC = () => (
  <StoryBlock title="Tooltip">
    <div className="flex flex-wrap items-center gap-6 p-6">
      <Tooltip label="Show answers" shortcut="a">
        <ButtonIcon icon={EyeIcon} label="Show answers" />
      </Tooltip>
      <Tooltip label="Info Panel" shortcut="i">
        <ButtonIcon icon={EyeIcon} label="Info Panel" active />
      </Tooltip>
      <Tooltip label="Plain text, no shortcut">
        <ButtonIcon icon={EyeIcon} label="Plain" />
      </Tooltip>
    </div>
  </StoryBlock>
);
