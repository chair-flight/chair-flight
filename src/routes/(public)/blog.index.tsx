import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { formatIsoDateAsDate } from "../../libs/base/format-values";
import { BackgroundForPublic } from "../../libs/ui/components/backgrounds/background-for-public";
import { Public } from "../../libs/ui/components/containers/public";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

type BlogPostSummary = {
  id: string;
  title: string;
  date: string;
  tag: string;
  description: string;
  image: string | null;
};

const BLOG_INDEX = import.meta.glob<BlogPostSummary[]>(
  "/generated/blog/index.json",
  { import: "default", eager: true },
);

const getBlogPageData = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(() => {
    return Object.values(BLOG_INDEX)[0] ?? [];
  });

const BlogPage: FC = () => {
  const posts = Route.useLoaderData();

  return (
    <Public>
      <BackgroundForPublic />
      <Public.Header showBlogLink showGithubLink showThemeToggle />
      <Public.Main>
        <div
          className={cn(
            "mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10",
            "sm:py-16",
          )}
        >
          <h1 className="m-0 text-4xl font-bold tracking-tighter sm:text-5xl">
            Blog
          </h1>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
            {posts.map((post, index) => (
              <li key={post.id} className={cn(index === 0 && "md:col-span-2")}>
                <Link
                  to="/blog/$postId"
                  params={{ postId: post.id }}
                  className={cn(
                    "group flex h-full flex-col gap-4 rounded-2xl border",
                    "border-rule bg-paper/80 p-3 text-ink no-underline",
                    "backdrop-blur transition-colors hover:border-accent",
                    index === 0 && "md:flex-row md:gap-8 md:p-4",
                  )}
                >
                  <div
                    className={cn(
                      "relative aspect-video w-full overflow-hidden rounded-xl",
                      "bg-accent-soft",
                      index === 0 &&
                        "md:aspect-auto md:min-h-64 md:w-1/2 md:flex-none",
                    )}
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        className={cn(
                          "absolute inset-0 size-full object-cover",
                          "transition-transform duration-500",
                          "group-hover:scale-105",
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex flex-1 flex-col gap-3 px-2 pb-2",
                      index === 0 && "md:justify-center md:py-4 md:pr-4",
                    )}
                  >
                    <span className="text-xs text-muted">
                      {formatIsoDateAsDate(post.date)}
                    </span>
                    <span
                      className={cn(
                        "font-bold tracking-tight group-hover:text-accent",
                        index === 0 ? "text-2xl sm:text-3xl" : "text-xl",
                      )}
                    >
                      {post.title}
                    </span>
                    <span className="line-clamp-3 text-sm leading-6 text-muted">
                      {post.description}
                    </span>
                    <span className="mt-auto pt-2 text-xs font-medium text-accent">
                      Read more →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Public.Footer />
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute("/(public)/blog/")({
  component: BlogPage,
  loader: () => getBlogPageData(),
  head: () =>
    buildPageHead({
      title: "Blog · Chair Flight",
      description:
        "News, new question banks and technical updates from Chair Flight.",
      path: "/blog",
    }),
});
