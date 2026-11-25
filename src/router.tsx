import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: false,
    defaultPreload: "intent",
  });

  router.subscribe("onRendered", ({ pathChanged }) => {
    if (!pathChanged || typeof document === "undefined") return;
    window.scrollTo({ top: 0 });
    document.querySelectorAll("[data-scroll-reset]").forEach((element) => {
      element.scrollTo({ top: 0 });
    });
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
