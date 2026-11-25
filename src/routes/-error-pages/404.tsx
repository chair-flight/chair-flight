import { createLink, Link } from "@tanstack/react-router";
import { Button } from "../../libs/ui/components/base/button";
import { Logo } from "../../libs/ui/components/base/logo";
import { ThemeToggle } from "../../libs/ui/components/base/theme-toggle";
import { ChevronRightIcon } from "../../libs/ui/icons/chevron-right-icon";
import { GraphicLostFlightChart } from "../../libs/ui/outlines/graphic-lost-flight-chart";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

const BACKGROUND_GRADIENT = [
  "radial-gradient(ellipse at 5% 15%,",
  "color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%)",
  ", radial-gradient(ellipse at 95% 85%,",
  "color-mix(in srgb, var(--accent) 14%, transparent), transparent 55%)",
].join(" ");

const ButtonLink = createLink(Button);

export const NotFoundPage: FC = () => {
  return (
    <div
      className="relative isolate flex min-h-dvh flex-col bg-canvas text-ink"
      style={{ backgroundImage: BACKGROUND_GRADIENT }}
    >
      <header
        className={cn(
          "relative z-20 flex h-10 flex-none items-center border-b",
          "border-rule bg-paper/80 pr-4 pl-2 backdrop-blur",
        )}
      >
        <Link to="/" className="flex items-center gap-2 text-ink no-underline">
          <Logo />
          <span
            className={cn(
              "text-sm font-bold tracking-widest whitespace-nowrap uppercase",
            )}
          >
            Chair Flight
          </span>
        </Link>
        <span className="flex-1" />
        <ThemeToggle />
      </header>
      <main
        className={cn(
          "mx-auto grid w-full max-w-6xl flex-1 content-center",
          "justify-items-center gap-x-10 px-5 py-8 text-center",
          "md:grid-cols-2 md:grid-rows-[auto_auto] md:justify-items-start",
          "md:px-10 md:text-left",
        )}
      >
        <div className="flex flex-col items-center gap-3 md:items-start md:self-end">
          <p
            className={cn(
              "m-0 text-sm font-semibold tracking-widest text-accent",
              "uppercase",
            )}
          >
            Error 404
          </p>
          <h1
            className={cn(
              "m-0 text-4xl leading-none font-bold tracking-tighter",
              "md:text-6xl",
            )}
          >
            Content not found
          </h1>
          <p className="m-0 max-w-md text-muted">
            The page you are looking for has been moved, or never existed. Check
            the address, or head back to a known waypoint.
          </p>
        </div>
        <div
          className={cn(
            "w-full max-w-sm self-center",
            "md:col-start-2 md:row-span-2 md:row-start-1 md:max-w-none",
          )}
        >
          <GraphicLostFlightChart className="h-full w-full text-accent" />
        </div>
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-3",
            "md:mt-7 md:justify-start md:self-start",
          )}
        >
          <ButtonLink to="/" variant="primary" size="large">
            Back to home
          </ButtonLink>
          <ButtonLink to="/question-banks" size="large">
            Start studying
            <ChevronRightIcon />
          </ButtonLink>
        </div>
      </main>
    </div>
  );
};
