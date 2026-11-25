import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const InfoModeIcon: FC<IconProps> = (props) => (
  <SvgIcon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 8h.01M8 11v5m5-6h4m-4 4h4" />
  </SvgIcon>
);
