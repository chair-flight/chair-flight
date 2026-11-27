import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const PencilIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2 14l0.74 -2.98L11.3 2.46a1.56 1.56 0 0 1 2.23 2.23L4.98 13.26l-2.98 0.74zM9.44 4.32l2.23 2.23" />
    </SvgIcon>
  );
};
