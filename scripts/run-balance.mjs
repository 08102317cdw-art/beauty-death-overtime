import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "bdo-"));
const outfile = join(dir, "balance.mjs");
await build({
  entryPoints: ["src/game/systems/balance.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
});
const child = spawnSync(process.execPath, ["--input-type=module", "-e", `import { runBalance } from ${JSON.stringify(outfile)}; runBalance();`], {
  stdio: "inherit",
});
process.exit(child.status ?? 1);
