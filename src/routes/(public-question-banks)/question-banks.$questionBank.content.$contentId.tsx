import {
  createFileRoute,
  notFound,
  Outlet,
  useLocation,
  useMatchRoute,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { useEffect } from "react";
import { z } from "zod/mini";
import { questionBankNameSchema } from "../../libs/core/content/question-bank-name";
import { getQuestionBankDb } from "../../libs/providers/question-bank-db";
import { Public } from "../../libs/ui/components/containers/public";
import { useDisclose } from "../../libs/ui/hooks/use-disclose";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import type { FC } from "react";

const TABS = [
  {
    id: "home",
    label: "Home",
    to: "/question-banks/$questionBank/content/$contentId",
  },
  {
    id: "questions",
    label: "Questions",
    to: "/question-banks/$questionBank/content/$contentId/questions",
  },
  {
    id: "learning-objectives",
    label: "Learning objectives",
    to: "/question-banks/$questionBank/content/$contentId/learning-objectives",
  },
] as const;

const paramsSchema = z.object({
  questionBank: questionBankNameSchema,
  contentId: z.string(),
});

const getContentPageData = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator(paramsSchema)
  .handler(async ({ data }) => {
    const { questionBank, contentId } = data;
    const index = await getQuestionBankDb().getQuestionBank(questionBank);

    const subject = index.subjectsMap.get(contentId);
    const chapter = index.chaptersMap.get(contentId);
    if (!subject && !chapter && !index.learningObjectivesMap.has(contentId)) {
      throw notFound();
    }
    if (subject && index.id === "atpl_a") throw notFound();

    const title = subject?.shortName ?? chapter?.title ?? contentId;
    const label = title.length > 28 ? contentId : title;

    return {
      label,
      shortTitle: index.shortTitle,
      breadcrumbs: [
        {
          label: index.shortTitle,
          link: {
            to: "/question-banks/$questionBank" as const,
            params: { questionBank },
          },
        },
        { label, mono: true },
      ],
    };
  });

const ContentLayoutPage: FC = () => {
  const data = Route.useLoaderData();
  const { questionBank, contentId } = Route.useParams();
  const matchRoute = useMatchRoute();
  const pathname = useLocation({ select: (location) => location.pathname });
  const hamburger = useDisclose();
  const { label } = data;

  const entries = TABS.map((tab) => ({
    id: tab.id,
    label: tab.id === "home" ? label : tab.label,
    active: Boolean(
      matchRoute({ to: tab.to, params: { questionBank, contentId } }),
    ),
    link: {
      to: tab.to,
      params: { questionBank, contentId },
      activeOptions: { exact: true, includeSearch: false },
    },
  }));

  useEffect(() => {
    hamburger.close();
  }, [pathname, hamburger.close]);

  return (
    <Public>
      <Public.Header
        showThemeToggle
        showHamburgerMenu
        onHamburgerToggle={hamburger.toggle}
        breadcrumbs={data.breadcrumbs}
      />
      <Public.Main className="overflow-hidden">
        <div className="group/content flex min-h-0 flex-1">
          <Public.SidebarNav
            entries={entries}
            className="group-has-data-content-question-viewer/content:hidden"
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Outlet />
          </div>
        </div>
      </Public.Main>
      <Public.HamburgerMenu
        open={hamburger.isOpen}
        entries={entries}
        onClose={hamburger.close}
      />
    </Public>
  );
};

export const Route = createFileRoute(
  "/(public-question-banks)/question-banks/$questionBank/content/$contentId",
)({
  component: ContentLayoutPage,
  loader: ({ params }) =>
    getContentPageData({
      data: paramsSchema.parse(params),
    }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `${params.contentId} · ${loaderData?.shortTitle}`,
    }),
});
