import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const SearchIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <circle cx="7.03" cy="7.03" r="5.03" />
      <path d="m14 14 -3.41 -3.41" />
    </SvgIcon>
  );
};
