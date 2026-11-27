import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const UndoIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M5.75 9.5L2 5.75l3.75 -3.75" />
      <path d="M2 5.75h7.88a4.12 4.12 0 0 1 0 8.25H7.25" />
    </SvgIcon>
  );
};
