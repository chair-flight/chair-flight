/// <reference types="vite/client" />

import figtree400 from "@fontsource/figtree/files/figtree-latin-400-normal.woff2?url";
import figtree500 from "@fontsource/figtree/files/figtree-latin-500-normal.woff2?url";
import figtree600 from "@fontsource/figtree/files/figtree-latin-600-normal.woff2?url";
import figtree700 from "@fontsource/figtree/files/figtree-latin-700-normal.woff2?url";
import {
  createRootRoute,
  HeadContent,
  ScriptOnce,
  Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "../libs/ui/components/base/toaster";
import { THEME_SCRIPT } from "../libs/ui/hooks/use-theme";
import { buildPageHead } from "../libs/ui/utils/build-page-head";
import { NotFoundPage } from "./-error-pages/404";
import { ErrorPage } from "./-error-pages/500";
import type { FC, PropsWithChildren } from "react";
import appCss from "../styles.css?url";

const RootDocument: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{THEME_SCRIPT}</ScriptOnce>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster />
        <Scripts />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      ...buildPageHead({ title: "Chair Flight" }).meta,
      { name: "theme-color", content: "#0b6bcb" },
    ],
    links: [
      ...[figtree400, figtree500, figtree600, figtree700].map((href) => {
        return {
          rel: "preload",
          href,
          as: "font",
          type: "font/woff2",
          crossOrigin: "anonymous" as const,
        };
      }),
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: ({ children }) => <RootDocument>{children}</RootDocument>,
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
});
