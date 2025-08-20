import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, emitTypeScript, emitPython } from "@il/core";

// --- Configuración de Transpiladores ---
// Define aquí cada lenguaje de destino.
const TRANSPILER_TARGETS = [
  {
    name: "ts",
    fileExtension: ".ts",
    // Los goldens de TS están en el subdirectorio 'ts'.
    goldensSubDir: "ts",
    transpiler: (program) => emitTypeScript(program),
  },
  {
    name: "py",
    fileExtension: ".py",
    // Los goldens de Py están en el subdirectorio 'py'.
    goldensSubDir: "py",
    transpiler: (program) => emitPython(program),
  },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesRoot = path.resolve(__dirname, "..");
// CORRECCIÓN: Los ficheros .il están dentro de 'intentlang'
const sourceIlDir = path.join(examplesRoot, "intentlang");
const goldensRoot = path.join(examplesRoot, "goldens");
const datasetsDir = path.join(examplesRoot, "datasets");

// Asegúrate de que el directorio de datasets exista
fs.mkdirSync(datasetsDir, { recursive: true });

// --- Lógica Principal ---

for (const target of TRANSPILER_TARGETS) {
  const entries = [];
  const goldensDir = path.join(goldensRoot, target.goldensSubDir);

  if (!fs.existsSync(goldensDir)) {
    console.warn(
      `[${target.name}] Skipping target: directory not found at ${goldensDir}`,
    );
    continue;
  }

  // Itera sobre los ficheros en el directorio de código fuente .il
  for (const file of fs.readdirSync(sourceIlDir)) {
    if (!file.endsWith(".il")) continue;

    const baseName = path.basename(file, ".il");
    const ilPath = path.join(sourceIlDir, file);
    const goldenPath = path.join(
      goldensDir,
      `${baseName}${target.fileExtension}`,
    );

    if (!fs.existsSync(goldenPath)) {
      console.warn(
        `[${target.name}] Skipping ${file}: missing golden file at ${goldenPath}`,
      );
      continue;
    }

    const source_il = fs.readFileSync(ilPath, "utf8");
    const transpiled_target = fs.readFileSync(goldenPath, "utf8");
    let ast = null;

    try {
      ast = parse(source_il);
    } catch (err) {
      console.warn(`[AST] Failed to parse ${file}: ${err.message}`);
    }

    const entry = {
      source_il,
      [`transpiled_${target.name}`]: transpiled_target,
      ast,
    };
    entries.push(JSON.stringify(entry));
  }

  if (entries.length > 0) {
    const outPath = path.join(datasetsDir, `dataset_il2${target.name}.jsonl`);
    fs.writeFileSync(outPath, entries.join("\n") + "\n");
    console.log(`✅ Wrote ${entries.length} examples to ${outPath}`);
  } else {
    console.log(`ℹ️ No entries generated for target "${target.name}".`);
  }
}
