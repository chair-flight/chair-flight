import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useTheme } from "../../hooks/use-theme";
import { ChevronLeftIcon } from "../../icons/chevron-left-icon";
import { MenuIcon } from "../../icons/menu-icon";
import { MoonIcon } from "../../icons/moon-icon";
import { SunIcon } from "../../icons/sun-icon";
import { cn } from "../../utils/cn";
import { ButtonIcon } from "../base/button-icon";
import { Logo } from "../base/logo";
import type { LinkProps } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";
import type { IconProps } from "../../icons/svg-icon";

const SIDEBAR_ITEM_CLASS_NAME = cn(
  "flex flex-none cursor-pointer items-center gap-3 border-0 border-b",
  "h-10 border-l-4 border-rule bg-transparent px-2 text-sm font-medium",
  "whitespace-nowrap no-underline hover:text-accent",
);

const SIDEBAR_ITEM_INACTIVE_CLASS_NAME = "border-l-transparent text-ink";

export const App: FC<{
  sidebar: {
    label: string;
    icon: FC<IconProps>;
    link: LinkProps;
    exact?: boolean;
  }[];
  breadcrumbs?: ReactNode;
  children: ReactNode;
}> = ({ sidebar, breadcrumbs, children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobile = useMediaQuery("(max-width: 639px)");
  const { theme, toggleTheme } = useTheme();
  const expanded = mobile ? mobileOpen : open;

  return (
    <div
      className={cn(
        "grid h-dvh grid-cols-[1fr] grid-rows-[2.5rem_minmax(0,1fr)]",
        "bg-canvas text-ink",
        "transition-[grid-template-columns] duration-250",
        open ? "sm:grid-cols-[210px_1fr]" : "sm:grid-cols-[40px_1fr]",
      )}
    >
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden",
          !mobileOpen && "hidden",
        )}
      />
      <nav
        className={cn(
          "z-40 flex flex-col overflow-x-hidden border-rule bg-paper",
          "row-span-2 max-sm:fixed max-sm:inset-y-0 max-sm:left-0",
          "sm:border-r max-sm:transition-[width] max-sm:duration-250",
          mobileOpen ? "w-[210px] border-r" : "max-sm:w-0",
        )}
      >
        <Link
          to="/"
          className={cn(
            "flex h-10 flex-none items-center gap-2 border-b border-rule",
            "pl-2 text-ink no-underline",
          )}
        >
          <Logo />
          <span
            className={cn(
              "text-sm font-bold tracking-widest whitespace-nowrap uppercase",
            )}
          >
            Chair Flight
          </span>
        </Link>
        {sidebar.map((item) => (
          <Link
            key={item.label}
            {...item.link}
            title={item.label}
            activeOptions={{ exact: item.exact }}
            activeProps={{ className: "border-l-accent text-accent" }}
            inactiveProps={{ className: SIDEBAR_ITEM_INACTIVE_CLASS_NAME }}
            onClick={() => setMobileOpen(false)}
            className={SIDEBAR_ITEM_CLASS_NAME}
          >
            <item.icon size={20} className="flex-none" />
            <span>{item.label}</span>
          </Link>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          className={cn(
            SIDEBAR_ITEM_CLASS_NAME,
            SIDEBAR_ITEM_INACTIVE_CLASS_NAME,
            "border-t",
          )}
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <SunIcon size={20} className="flex-none" />
          ) : (
            <MoonIcon size={20} className="flex-none" />
          )}
          <span>{theme === "light" ? "Light mode" : "Dark mode"}</span>
        </button>
        <button
          type="button"
          aria-label={expanded ? "Collapse menu" : "Expand menu"}
          className={cn(
            SIDEBAR_ITEM_CLASS_NAME,
            SIDEBAR_ITEM_INACTIVE_CLASS_NAME,
            "border-t",
          )}
          onClick={() => (mobile ? setMobileOpen(false) : setOpen(!open))}
        >
          <ChevronLeftIcon
            size={20}
            className={cn(
              "flex-none sm:transition-transform sm:duration-250",
              !expanded && "sm:rotate-180",
            )}
          />
          <span>Collapse</span>
        </button>
      </nav>
      <header
        className={cn(
          "col-start-1 row-start-1 flex min-w-0 items-center gap-2",
          "border-b border-rule bg-paper px-4 sm:col-start-2",
        )}
      >
        {breadcrumbs}
        <div className="flex-1" />
        <ButtonIcon
          icon={MenuIcon}
          label="Open menu"
          className="sm:hidden"
          onClick={() => setMobileOpen(true)}
        />
      </header>
      <main
        data-scroll-reset
        className={cn(
          "col-start-1 row-start-2 min-h-0 min-w-0 overflow-auto",
          "overscroll-contain sm:col-start-2",
        )}
      >
        {children}
      </main>
    </div>
  );
};
