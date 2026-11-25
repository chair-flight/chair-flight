import { Link } from "@tanstack/react-router";
import { GithubIcon } from "../../icons/github-icon";
import { cn } from "../../utils/cn";
import { Breadcrumbs } from "../base/breadcrumbs";
import { ButtonIcon } from "../base/button-icon";
import { Logo } from "../base/logo";
import { ThemeToggle } from "../base/theme-toggle";
import type { FC, ReactNode } from "react";
import type { Breadcrumb } from "../base/breadcrumbs";

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

const Header: FC<{
  logoOnly?: boolean;
  showBlogLink?: boolean;
  breadcrumbs?: Breadcrumb[];
  showGithubLink?: boolean;
  showThemeToggle?: boolean;
}> = ({
  logoOnly = false,
  showBlogLink = false,
  breadcrumbs,
  showGithubLink = false,
  showThemeToggle = false,
}) => {
  return (
    <header
      className={cn(
        "relative z-20 flex h-10 flex-none items-center gap-3 border-b sm:gap-6",
        "border-rule bg-paper pr-4 pl-2",
      )}
    >
      <Link to="/" className="flex items-center gap-2 text-ink no-underline">
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
      <div className="flex items-center gap-1">
        {showGithubLink && (
          <a
            href="https://github.com/chair-flight/chair-flight"
            target="_blank"
            rel="noreferrer"
          >
            <ButtonIcon icon={GithubIcon} label="GitHub" tabIndex={-1} />
          </a>
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
      "pointer-events-none fixed inset-x-0 top-10 bottom-0",
      "isolate overflow-hidden bg-accent/10",
      className,
    )}
  >
    {children}
  </div>
);

const SectionA: FC<{ children: ReactNode }> = ({ children }) => (
  <section className="relative flex min-h-full shrink-0 flex-col">
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

export const Public = Object.assign(Root, {
  Header,
  Main,
  BackgroundContainer,
  SectionA,
  SectionB,
  Footer,
});
