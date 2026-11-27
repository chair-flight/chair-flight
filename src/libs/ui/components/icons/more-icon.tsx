import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const MoreIcon: FC<IconProps> = (props) => (
  <SvgIcon {...props} filled>
    <circle cx="2.81" cy="8" r="1.48" />
    <circle cx="8" cy="8" r="1.48" />
    <circle cx="13.19" cy="8" r="1.48" />
  </SvgIcon>
);
