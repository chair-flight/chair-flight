import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ChevronRightIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M5 2l6 6 -6 6" />
    </SvgIcon>
  );
};
