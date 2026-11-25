import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const NavModeIcon: FC<IconProps> = (props) => (
  <SvgIcon {...props} strokeWidth={3}>
    <path d="M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01" />
  </SvgIcon>
);
