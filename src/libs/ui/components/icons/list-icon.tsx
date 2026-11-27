import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ListIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M5.75 3.5h8.25M5.75 8h8.25M5.75 12.5h8.25M2 3.5h0.01M2 8h0.01M2 12.5h0.01" />
    </SvgIcon>
  );
};
