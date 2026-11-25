import { createReadStream } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { compileBlog } from "./compile-blog.ts";
import { compileQuestionBanks } from "./compile-question-banks.ts";
import type { Plugin } from "vite";

const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
const BANK_FOLDER_MATCH = /^question-bank-[a-z0-9_]+$/;
const BANK_SOURCE_MATCH = /^content[/\\]question-bank-.*\.yaml$/;
const BLOG_SOURCE_MATCH = /^content[/\\]blog[/\\]/;

export const contentAssetsPlugin = (): Plugin => {
  let started = false;
  let building = false;

  return {
    name: "chair-flight-content-assets",

    configResolved: (config) => {
      building = config.command === "build";
    },

    configureServer: (server) => {
      let timer: NodeJS.Timeout | undefined;

      server.watcher.add("content");
      server.watcher.on("all", (_, changedFile) => {
        const relative = path.relative(process.cwd(), changedFile);
        const isBankSource = BANK_SOURCE_MATCH.test(relative);
        const isBlogSource = BLOG_SOURCE_MATCH.test(relative);
        if (!isBankSource && !isBlogSource) return;
        clearTimeout(timer);
        timer = setTimeout(() => {
          const compiling = isBankSource
            ? compileQuestionBanks()
            : compileBlog();
          compiling.catch((error) => server.config.logger.error(error));
        }, 200);
      });

      server.middlewares.use("/content", (request, response, next) => {
        const requestedPath = decodeURIComponent(
          (request.url ?? "").split("?")[0],
        );
        const [kind, folder, fileName] = requestedPath
          .replace(/^\/+/, "")
          .split("/");
        if (!kind || !folder || !fileName) return next();
        if (!(path.extname(fileName) in IMAGE_TYPES)) return next();

        const bankFolder = `question-bank-${path.basename(folder)}`;
        const isAnnex =
          kind === "annexes" && BANK_FOLDER_MATCH.test(bankFolder);
        const isBlog = kind === "blog";
        if (!isAnnex && !isBlog) return next();
        const file = isAnnex
          ? path.join("content", bankFolder, "annexes", path.basename(fileName))
          : path.join(
              "content",
              "blog",
              path.basename(folder),
              path.basename(fileName),
            );

        const stream = createReadStream(file);
        stream.on("error", () => next());
        stream.on("open", () => {
          response.writeHead(200, {
            "content-type": IMAGE_TYPES[path.extname(file)],
            "cache-control": "no-cache",
          });
          stream.pipe(response);
        });
      });
    },

    buildStart: async () => {
      if (started) return;
      started = true;

      if (building) {
        const publicFolder = path.join("public", "content");
        await fs.rm(publicFolder, { recursive: true, force: true });

        const contentFolders = await fs.readdir("content");
        const bankFolders = contentFolders.filter((folder) =>
          BANK_FOLDER_MATCH.test(folder),
        );
        const unsortedPostFolders = await fs
          .readdir(path.join("content", "blog"))
          .catch(() => []);
        const imageFolders = [
          ...bankFolders.map((folder) => ({
            source: path.join("content", folder, "annexes"),
            target: path.join(
              publicFolder,
              "annexes",
              folder.replace("question-bank-", ""),
            ),
          })),
          ...unsortedPostFolders.map((folder) => ({
            source: path.join("content", "blog", folder),
            target: path.join(publicFolder, "blog", folder),
          })),
        ];

        await Promise.all(
          imageFolders.map(async ({ source, target }) => {
            const files = await fs.readdir(source).catch(() => []);
            const images = files.filter(
              (file) => path.extname(file) in IMAGE_TYPES,
            );
            if (images.length === 0) return;
            await fs.mkdir(target, { recursive: true });
            await Promise.all(
              images.map((image) =>
                fs.copyFile(path.join(source, image), path.join(target, image)),
              ),
            );
          }),
        );
      }

      await Promise.all([compileQuestionBanks(), compileBlog()]);
    },
  };
};
