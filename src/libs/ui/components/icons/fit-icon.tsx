import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const FitIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2 5.75V2h3.75M14 5.75V2h-3.75M2 10.25v3.75h3.75M14 10.25v3.75h-3.75" />
    </SvgIcon>
  );
};
