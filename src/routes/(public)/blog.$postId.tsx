import { createFileRoute, createLink, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { z } from "zod/mini";
import { formatIsoDateAsDate } from "../../libs/base/format-values";
import { BackgroundForPublic } from "../../libs/ui/components/backgrounds/background-for-public";
import { Button } from "../../libs/ui/components/base/button";
import { Markdown } from "../../libs/ui/components/base/markdown";
import { Public } from "../../libs/ui/components/containers/public";
import { AirplaneCessna172 } from "../../libs/ui/components/outlines/airplane-cessna-172";
import { buildPageHead } from "../../libs/ui/utils/build-page-head";
import { cn } from "../../libs/ui/utils/cn";
import type { FC } from "react";

type BlogPost = {
  id: string;
  title: string;
  date: string;
  tag: string;
  description: string;
  content: string;
  image: string | null;
};

const ButtonLink = createLink(Button);

const BLOG_POSTS = import.meta.glob<BlogPost>("/generated/blog/posts/*.json", {
  import: "default",
});

const getBlogPostPageData = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .validator(z.object({ postId: z.string().check(z.minLength(1)) }))
  .handler(async ({ data }) => {
    const loadPost = BLOG_POSTS[`/generated/blog/posts/${data.postId}.json`];
    if (!loadPost) throw notFound();
    return loadPost();
  });

const BlogPostPage: FC = () => {
  const post = Route.useLoaderData();

  return (
    <Public>
      <BackgroundForPublic />
      <Public.Header
        logoOnly
        breadcrumbs={[
          { label: "Blog", link: { to: "/blog" } },
          { label: post.title },
        ]}
        showGithubLink
        showThemeToggle
      />
      <Public.Main>
        <div
          className={cn(
            "mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10",
            "sm:py-16",
          )}
        >
          <article
            className={cn(
              "flex flex-col gap-8 rounded-2xl border border-rule bg-paper/85",
              "p-5 backdrop-blur sm:p-10",
            )}
          >
            <div
              className={cn(
                "relative -mx-2 -mt-2 aspect-video overflow-hidden rounded-xl",
                "bg-accent-soft sm:-mx-6 sm:-mt-6 sm:aspect-21/9",
              )}
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <AirplaneCessna172
                  className={cn(
                    "absolute inset-x-[10%] bottom-[10%] w-[80%] text-brand",
                    "opacity-30",
                  )}
                />
              )}
            </div>
            <header className="flex flex-col gap-3">
              <span className="text-xs text-muted">
                {formatIsoDateAsDate(post.date)}
              </span>
              <h1
                className={cn(
                  "m-0 text-3xl leading-tight font-bold tracking-tighter",
                  "sm:text-4xl",
                )}
              >
                {post.title}
              </h1>
            </header>
            <Markdown renderAnnexes className="text-base leading-7">
              {post.content}
            </Markdown>
            <hr className="m-0 w-full border-0 border-t border-rule" />
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <ButtonLink to="/blog" size="large">
                Read more posts
              </ButtonLink>
              <ButtonLink to="/question-banks" variant="primary" size="large">
                Start studying
              </ButtonLink>
            </div>
          </article>
        </div>
        <Public.Footer />
      </Public.Main>
    </Public>
  );
};

export const Route = createFileRoute("/(public)/blog/$postId")({
  component: BlogPostPage,
  loader: ({ params }) => getBlogPostPageData({ data: params }),
  head: ({ loaderData, params }) =>
    buildPageHead({
      title: `${loaderData?.title ?? "Blog"} · Chair Flight`,
      description: loaderData?.description,
      path: `/blog/${params.postId}`,
      image: loaderData?.image ?? undefined,
      type: "article",
    }),
});
