import chokidar from "chokidar";
import { colors } from "../term/colors.js";

/**
 * Watch a list of files and invoke a callback after debouncing changes.
 */
export function setupWatcher(files: string[], callback: () => Promise<void>) {
  const watcher = chokidar.watch(files, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  });

  let timer: NodeJS.Timeout | null = null;
  const debounce = (fn: () => void, ms: number) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };

  watcher.on("ready", () => {
    console.error(colors.gray(`\n[Watching] Ready. Awaiting changes...`));
  });

  watcher.on("all", (event: string, filePath: string) => {
    console.error(
      colors.gray(
        `\n[Watching] File changed: ${colors.cyan(filePath)}. Rerunning...`,
      ),
    );
    debounce(() => void callback(), 60);
  });

  process.on("SIGINT", () => {
    console.error(colors.gray("\n[Watching] Shutting down."));
    watcher.close();
    process.exit(0);
  });
}
