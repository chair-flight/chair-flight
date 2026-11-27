import { existsSync, readdirSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { type BuildEnvironmentOptions, defineConfig } from "vite";
import { contentAssetsPlugin } from "./src/tools/vite-content-assets.ts";

const IGNORED_WARNINGS = new Set([
	"MODULE_LEVEL_DIRECTIVE",
	"MISSING_CODE_SPLITTING_GROUP_DEBUG_NAME",
]);

const onLog: NonNullable<
	NonNullable<BuildEnvironmentOptions["rolldownOptions"]>["onLog"]
> = (level, log, defaultHandler) => {
	if (level === "warn" && IGNORED_WARNINGS.has(log.code ?? "")) return;
	defaultHandler(level, log);
};

const blogPostPages = readdirSync("content/blog")
	.filter((folder) => existsSync(`content/blog/${folder}/page.md`))
	.map((folder) => ({ path: `/blog/${folder}` }));

const questionBankPages = [
	...["atpl_a", "ppl_a", "b737", "a320"].flatMap((bank) => [
		{ path: `/question-banks/${bank}` },
		{ path: `/question-banks/${bank}/tests/new` },
	]),
];

export default defineConfig({
	resolve: { tsconfigPaths: true },
	// Env files are loaded by the package.json scripts (`node --env-file`), so
	// `pnpm dev` never picks up `.env.local` behind our back.
	envDir: false,
	server: { port: 3100, strictPort: true },
	preview: { port: 3100, strictPort: false },
	build: { rolldownOptions: { onLog } },
	environments: { nitro: { build: { rolldownOptions: { onLog } } } },
	plugins: [
		contentAssetsPlugin(),
		tailwindcss(),
		tanstackStart({
			pages: [...blogPostPages, ...questionBankPages],
			prerender: {
				enabled: true,
				crawlLinks: false,
				concurrency: 1,
				filter: ({ path }) => !path.startsWith("/admin"),
			},
		}),
		nitro(),
		viteReact(),
	],
});
