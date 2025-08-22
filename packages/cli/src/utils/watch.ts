// Refactorization Notes:
// New module to encapsulate file watching logic using chokidar.

import chokidar from "chokidar";
import { colors } from "../term/colors.js";

export function setupWatcher(files: string[], callback: () => Promise<void>) {
  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  });

  watcher.on("ready", () => {
    console.error(colors.gray(`\n[Watching] Ready. Awaiting changes...`));
  });

  watcher.on("all", (event, filePath) => {
    console.error(
      colors.gray(
        `\n[Watching] File changed: ${colors.cyan(filePath)}. Rerunning...`,
      ),
    );
    callback();
  });

  process.on("SIGINT", () => {
    console.error(colors.gray("\n[Watching] Shutting down."));
    watcher.close();
    process.exit(0);
  });
}
