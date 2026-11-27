import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { cn } from "../../utils/cn";
import { Breadcrumbs } from "../base/breadcrumbs";
import { ButtonIcon } from "../base/button-icon";
import { Logo } from "../base/logo";
import { ThemeToggle } from "../base/theme-toggle";
import { GithubIcon } from "../icons/github-icon";
import { MenuIcon } from "../icons/menu-icon";
import type { LinkProps } from "@tanstack/react-router";
import type { FC, ReactNode } from "react";
import type { Breadcrumb } from "../base/breadcrumbs";

type NavEntry = {
  id: string;
  label: string;
  active?: boolean;
  link?: LinkProps;
  onSelect?: () => void;
  entries?: NavEntry[];
};

const Root: FC<{
  children: ReactNode;
}> = ({ children }) => {
  return (
    <div
      className={cn(
        "relative isolate flex h-dvh flex-col overflow-hidden",
        "bg-canvas",
        "bg-[radial-gradient(ellipse_at_5%_15%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_55%),radial-gradient(ellipse_at_95%_85%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_55%)]",
        "text-ink",
      )}
    >
      {children}
    </div>
  );
};

const NavList: FC<{
  entries: NavEntry[];
  depth?: number;
  onNavigate?: () => void;
}> = ({ entries, depth = 0, onNavigate }) => (
  <ul className="m-0 flex list-none flex-col gap-1 p-0">
    {entries.map((entry) => (
      <li key={entry.id} className="flex flex-col gap-1">
        {(() => {
          const className = cn(
            "flex w-full cursor-pointer items-center rounded-md py-2 pr-3",
            "text-left text-sm font-medium no-underline",
            entry.active
              ? "bg-accent-soft text-accent"
              : "bg-transparent text-ink hover:text-accent",
          );
          const style = { paddingLeft: `${0.75 + depth * 0.75}rem` };
          return entry.link ? (
            <Link
              {...entry.link}
              aria-current={entry.active ? "page" : undefined}
              onClick={() => onNavigate?.()}
              style={style}
              className={className}
            >
              {entry.label}
            </Link>
          ) : (
            <button
              type="button"
              aria-current={entry.active ? "page" : undefined}
              onClick={() => {
                entry.onSelect?.();
                onNavigate?.();
              }}
              style={style}
              className={cn(className, "border-0")}
            >
              {entry.label}
            </button>
          );
        })()}
        {entry.entries && (
          <NavList
            entries={entry.entries}
            depth={depth + 1}
            onNavigate={onNavigate}
          />
        )}
      </li>
    ))}
  </ul>
);

const Header: FC<{
  leading?: ReactNode;
  logoOnly?: boolean;
  showHamburgerMenu?: boolean;
  onHamburgerToggle?: () => void;
  showBlogLink?: boolean;
  breadcrumbs?: Breadcrumb[];
  showGithubLink?: boolean;
  showThemeToggle?: boolean;
}> = ({
  leading,
  breadcrumbs,
  logoOnly = false,
  showHamburgerMenu = false,
  onHamburgerToggle,
  showBlogLink = false,
  showGithubLink = false,
  showThemeToggle = false,
}) => {
  return (
    <header
      className={cn(
        "relative z-20 flex min-h-8 flex-none items-center gap-3 border-b",
        "border-rule bg-paper px-2 sm:gap-6 lg:h-10 lg:pr-4",
      )}
    >
      {leading}
      <Link
        to="/"
        className={cn(
          "flex items-center gap-2 text-ink no-underline",
          "max-lg:min-h-8 max-lg:min-w-8",
        )}
      >
        <Logo />
        {!logoOnly && (
          <span
            className={cn(
              "text-sm font-bold tracking-widest whitespace-nowrap uppercase",
              breadcrumbs && "max-md:hidden",
            )}
          >
            Chair Flight
          </span>
        )}
      </Link>
      {showBlogLink && (
        <Link
          to="/blog"
          className="text-sm font-medium text-ink no-underline hover:text-accent"
        >
          Blog
        </Link>
      )}
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      {!breadcrumbs && <span className="flex-1" />}
      <div className="flex flex-none items-center lg:gap-1">
        {showGithubLink && (
          <a
            href="https://github.com/chair-flight/chair-flight"
            target="_blank"
            rel="noreferrer"
          >
            <ButtonIcon icon={GithubIcon} label="GitHub" tabIndex={-1} />
          </a>
        )}
        {showHamburgerMenu && (
          <ButtonIcon
            icon={MenuIcon}
            label="Menu"
            className="md:hidden"
            onClick={onHamburgerToggle}
          />
        )}
        {showThemeToggle && <ThemeToggle />}
      </div>
    </header>
  );
};

const Main: FC<{
  className?: string;
  children: ReactNode;
}> = ({ className, children }) => {
  return (
    <main
      data-scroll-reset
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
        className,
      )}
    >
      {children}
    </main>
  );
};

const BackgroundContainer: FC<{
  className?: string;
  children: ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "pointer-events-none fixed inset-x-0 top-8 bottom-0 lg:top-10",
      "isolate overflow-hidden bg-accent/10",
      className,
    )}
  >
    {children}
  </div>
);

const SectionA: FC<{
  id?: string;
  children: ReactNode;
}> = ({ id, children }) => (
  <section id={id} className="relative flex min-h-full shrink-0 flex-col">
    {children}
  </section>
);

const SectionB: FC<{
  id?: string;
  children: ReactNode;
}> = ({ id, children }) => (
  <section
    id={id}
    className={cn(
      "relative flex min-h-full shrink-0 flex-col justify-center",
      "bg-canvas/85",
    )}
  >
    {children}
  </section>
);

const Footer: FC = () => {
  return (
    <footer className="flex flex-none justify-center gap-5 px-4 py-4 text-xs">
      <Link to="/about" className="text-accent no-underline hover:underline">
        About
      </Link>
      <Link to="/terms" className="text-accent no-underline hover:underline">
        Terms of service
      </Link>
      <Link to="/privacy" className="text-accent no-underline hover:underline">
        Privacy
      </Link>
    </footer>
  );
};

const HamburgerMenu: FC<{
  open: boolean;
  entries: NavEntry[];
  onClose: () => void;
}> = ({ open, entries, onClose }) => {
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", onClose);
    return () => window.removeEventListener("resize", onClose);
  }, [open, onClose]);

  return (
    <div
      inert={!open}
      className={cn(
        "fixed inset-0 z-50 overflow-hidden md:hidden",
        !open && "pointer-events-none",
      )}
    >
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default border-0 bg-black/50",
          "transition-opacity duration-150 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <nav
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col overflow-y-auto",
          "rounded-t-xl border-t border-rule bg-paper p-3",
          "transition-transform motion-reduce:transition-none",
          open
            ? "translate-y-0 duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "translate-y-full duration-150 ease-in",
        )}
      >
        <NavList entries={entries} onNavigate={onClose} />
      </nav>
    </div>
  );
};

const SidebarNav: FC<{
  entries: NavEntry[];
  className?: string;
}> = ({ entries, className }) => (
  <nav
    aria-label="Sections"
    className={cn(
      "hidden w-56 flex-none pt-6 md:order-last md:block",
      className,
    )}
  >
    <NavList entries={entries} />
  </nav>
);

export const Public = Object.assign(Root, {
  Header,
  Main,
  BackgroundContainer,
  SectionA,
  SectionB,
  Footer,
  HamburgerMenu,
  SidebarNav,
});
