import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const InfoModeIcon: FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <rect x="2" y="2.67" width="12" height="10.67" rx="1.33" />
    <path d="M5.33 5.33h0.01M5.33 7.33v3.33m3.33 -4h2.67m-2.67 2.67h2.67" />
  </SvgIcon>
);
