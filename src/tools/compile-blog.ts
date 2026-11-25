import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as YAML from "yaml";

const COVER_MATCH = /^cover\.(jpg|png|webp)$/;
const FRONT_MATTER_MATCH = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export const compileBlog = async () => {
  const sourceFolder = path.join("content", "blog");
  const outputFolder = path.join("generated", "blog");

  const unsortedPostFolders = await fs.readdir(sourceFolder).catch(() => []);
  const postFolders = unsortedPostFolders.toSorted();

  const posts = await Promise.all(
    postFolders.map(async (postFolder) => {
      const pageText = await fs.readFile(
        path.join(sourceFolder, postFolder, "page.md"),
        "utf-8",
      );
      const postFiles = await fs.readdir(path.join(sourceFolder, postFolder));
      const cover = postFiles.find((file) => COVER_MATCH.test(file));
      const image = cover ? `/content/blog/${postFolder}/${cover}` : null;
      const match = FRONT_MATTER_MATCH.exec(pageText);
      const data = match ? YAML.parse(match[1]) : {};
      return {
        id: postFolder,
        title: String(data.title ?? postFolder),
        image: image,
        date: String(data.date ?? ""),
        tag: String(data.tag ?? ""),
        description: String(data.description ?? "").trim(),
        content: pageText.slice(match?.[0].length ?? 0).trim(),
      };
    }),
  );

  const errors = posts.flatMap((post) => [
    ...(post.date ? [] : [`${post.id} has no date.`]),
    ...(post.tag ? [] : [`${post.id} has no tag.`]),
    ...(post.description ? [] : [`${post.id} has no description.`]),
  ]);
  if (errors.length > 0) {
    throw new Error(`Invalid blog content:\n${errors.join("\n")}`);
  }

  const index = posts
    .toSorted((a, b) => b.date.localeCompare(a.date))
    .map(({ content, ...summary }) => summary);

  const files = {
    "index.json": index,
    ...Object.fromEntries(
      posts.map((post) => [path.join("posts", `${post.id}.json`), post]),
    ),
  };
  const existingPosts = await fs
    .readdir(path.join(outputFolder, "posts"))
    .catch(() => []);
  const stalePosts = existingPosts.filter(
    (file) => !(path.join("posts", file) in files),
  );
  for (const file of stalePosts) {
    await fs.rm(path.join(outputFolder, "posts", file));
  }
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(outputFolder, file);
    const text = JSON.stringify(content);
    const current = await fs.readFile(target, "utf-8").catch(() => "");
    if (current === text) continue;
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, text);
  }
};
