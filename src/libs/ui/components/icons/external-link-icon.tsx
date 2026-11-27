import { SvgIcon } from "./svg-icon";
import type { FC } from "react";
import type { IconProps } from "./svg-icon";

export const ExternalLinkIcon: FC<IconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path d="M9.5 2h4.5v4.5M14 2l-6.75 6.75M12.5 9.5v3.75a0.75 0.75 0 0 1 -0.75 0.75H2.75a0.75 0.75 0 0 1 -0.75 -0.75V4.25a0.75 0.75 0 0 1 0.75 -0.75h3.75" />
    </SvgIcon>
  );
};
