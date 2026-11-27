import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const NavModeIcon: FC<IconProps> = (props) => (
  <SvgIcon {...props} strokeWidth={3}>
    <path d="M2.33 2.34h0.01M8 2.34h0.01M13.66 2.34h0.01M2.33 8h0.01M8 8h0.01M13.66 8h0.01M2.33 13.66h0.01M8 13.66h0.01M13.66 13.66h0.01" />
  </SvgIcon>
);
