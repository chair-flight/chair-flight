import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const UndoIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10.500a5.500 5.500 0 0 1 0 11H11" />
    </SvgIcon>
  );
};
