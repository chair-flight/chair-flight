import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const CheckIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M14 3.88 5.75 12.12l-3.75 -3.75" />
    </SvgIcon>
  );
};
