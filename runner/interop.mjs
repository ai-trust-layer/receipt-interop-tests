import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT   = process.cwd();
const JS_REPO = resolve(ROOT, "receipt-sdk-js");
const PY_REPO = resolve(ROOT, "receipt-sdk-py");

const jsCli = resolve(JS_REPO, "bin/receipt-verify.mjs");
const jsGen = resolve(JS_REPO, "scripts/make-signed-example.mjs");

const tmpJs = resolve(ROOT, "tmp-js.json");
const tmpPy = resolve(ROOT, "tmp-py.json");

const envPy = { ...process.env, PYTHONPATH: PY_REPO };

try {
  // 1) Generează receipt semnat în JS (stdout) și scrie-l pe disc
  const jsOut = execFileSync("node", [jsGen], { encoding: "utf8" });
  writeFileSync(tmpJs, jsOut);

  // 2) Verifică în Python (cu PYTHONPATH către SDK-ul Py)
  execFileSync("python", ["-m", "receipt_verify", tmpJs], {
    cwd: PY_REPO, env: envPy, stdio: "inherit"
  });

  // 3) Generează receipt semnat în Python (folosind același PYTHONPATH)
  const genPy = resolve(ROOT, "runner/gen_py_signed.py");
  execFileSync("python", [genPy, tmpPy], { env: envPy, stdio: "inherit" });

  // 4) Verifică în JS
  const out = execFileSync("node", [jsCli, tmpPy], { encoding: "utf8" });
  process.stdout.write(out);

  if (!out.trim().includes("signature: PASS")) process.exit(1);
} catch (e) {
  console.error(String(e));
  process.exit(1);
}
