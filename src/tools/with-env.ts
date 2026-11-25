import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const remote = args.includes("--prod");
const [command, ...commandArguments] = args.filter((arg) => arg !== "--prod");
if (!command) throw new Error("Usage: with-env.ts <command> [args] [--prod]");

process.loadEnvFile(remote ? ".env" : ".env.local");

process.on("SIGINT", () => {});
spawn(command, commandArguments, { stdio: "inherit" }).on("exit", (code) => {
  process.exit(code ?? 1);
});
