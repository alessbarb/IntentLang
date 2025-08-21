import fs from "node:fs";
import path from "node:path";
import { parse } from "jsonc-parser";
import type { ILConfig } from "./types.js";

/**
 * Busca y parsea `ilconfig.json` desde un directorio inicial hacia arriba.
 */
export function loadConfig(startDir: string = process.cwd()): {
  config: ILConfig;
  configPath?: string;
} {
  let currentDir = startDir;
  while (true) {
    const configPath = path.join(currentDir, "ilconfig.json");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      try {
        const config = parse(content) as ILConfig;
        return { config, configPath };
      } catch (e: any) {
        console.error(`Error: Could not parse ${configPath}: ${e.message}`);
        process.exit(1);
      }
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return { config: {}, configPath: undefined }; // Raíz del sistema de archivos alcanzada.
    }
    currentDir = parentDir;
  }
}
