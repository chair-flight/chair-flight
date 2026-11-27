import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const CopyIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <rect x="5.53" y="6.24" width="7.76" height="7.76" rx="1.41" />
      <path d="M2.71 10.47V3.41a1.41 1.41 0 0 1 1.41 -1.41h7.06" />
    </SvgIcon>
  );
};
