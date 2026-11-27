import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const BookIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M2.75 2h8.25a2.25 2.25 0 0 1 2.25 2.25v9.75H5a2.25 2.25 0 0 1 -2.25 -2.25z" />
      <path d="M2.75 11.75a2.25 2.25 0 0 1 2.25 -2.25h8.25" />
    </SvgIcon>
  );
};
