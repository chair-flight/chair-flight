import { cn } from "../../utils/cn";
import { SearchIcon } from "../icons/search-icon";
import type { ComponentProps, FC } from "react";

export const ButtonSearchBar: FC<
  ComponentProps<"button"> & { href?: string; label: string }
> = ({ label, type = "button", className, href, ...props }) => {
  const classes = cn(
    "flex h-10 w-full cursor-pointer items-center gap-3 rounded-md border",
    "border-rule bg-paper px-4 text-left text-sm text-muted no-underline",
    "hover:border-accent lg:h-12 lg:rounded-xl lg:text-base",
    className,
  );
  const content = (
    <>
      <SearchIcon size={16} className="flex-none" />
      {label}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...(props as ComponentProps<"a">)}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
};
