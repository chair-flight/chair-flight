import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const FitIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </SvgIcon>
  );
};
