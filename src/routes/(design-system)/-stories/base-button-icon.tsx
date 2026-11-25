import { ButtonIcon } from "../../../libs/ui/components/base/button-icon";
import { CloseIcon } from "../../../libs/ui/icons/close-icon";
import { MenuIcon } from "../../../libs/ui/icons/menu-icon";
import { RefreshIcon } from "../../../libs/ui/icons/refresh-icon";
import { StoryBlock } from "./story-block";
import type { FC } from "react";

export const BaseButtonIcon: FC = () => (
  <StoryBlock title="Enabled and disabled">
    <div className="flex items-center gap-3">
      <ButtonIcon icon={MenuIcon} label="Menu" />
      <ButtonIcon icon={RefreshIcon} label="Shuffle" />
      <ButtonIcon icon={CloseIcon} label="Disabled" disabled />
    </div>
  </StoryBlock>
);
