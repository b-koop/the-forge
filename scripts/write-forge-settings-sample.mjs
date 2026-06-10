import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { generateForgeSettingsFileSample } from "../src/forge-config.ts";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(repoRoot, "docs", "data", "forge-settings.sample.json");
const sample = generateForgeSettingsFileSample();

await writeFile(outputPath, `${JSON.stringify(sample, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
