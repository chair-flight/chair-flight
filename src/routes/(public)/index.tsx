import { createFileRoute, createLink } from "@tanstack/react-router";
import { BackgroundForPublic } from "../../libs/ui/components/backgrounds/background-for-public";
import { Button } from "../../libs/ui/components/base/button";
import { Public } from "../../libs/ui/components/containers/public";
import { Typical } from "../../libs/ui/components/elements/typical";
import { ChevronRightIcon } from "../../libs/ui/components/icons/chevron-right-icon";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

const ButtonLink = createLink(Button);

const HomePage: FC = () => (
  <Public>
    <BackgroundForPublic />
    <Public.Header showBlogLink showGithubLink showThemeToggle />
    <Public.Main>
      <div
        className={cn(
          "mx-auto flex w-full max-w-310 flex-1 flex-col items-center",
          "justify-center gap-6 p-4 text-center md:p-8",
        )}
      >
        <div>
          <h1
            className={cn(
              "m-0 text-3xl leading-tight font-bold tracking-tighter",
              "md:text-6xl",
            )}
          >
            Chair Flight is <br />
            <Typical
              steps={[
                "Community Built",
                2000,
                "Minimalistic",
                2000,
                "Free",
                2000,
              ]}
              className="inline-block whitespace-nowrap text-brand"
            />
          </h1>
          <h2 className="m-0 mt-2 text-xl font-semibold">
            Built by students for students.
          </h2>
        </div>
        <ButtonLink to="/question-banks" variant="primary" size="large">
          Start studying
          <ChevronRightIcon />
        </ButtonLink>
      </div>
      <Public.Footer />
    </Public.Main>
  </Public>
);

export const Route = createFileRoute("/(public)/")({
  component: HomePage,
  head: () => buildPageHead({ title: "Chair Flight", path: "/" }),
});
