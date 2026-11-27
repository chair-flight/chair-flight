import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const TrashIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2 4.25h12M6.5 7.25v4.5M9.5 7.25v4.5M3.5 4.25l0.75 9a0.75 0.75 0 0 0 0.75 0.75h6a0.75 0.75 0 0 0 0.75 -0.75l0.75 -9M5.75 4.25V2h4.5v2.25" />
    </SvgIcon>
  );
};
