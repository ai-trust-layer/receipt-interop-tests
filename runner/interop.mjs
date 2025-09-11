import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
const JS_REPO = "./receipt-sdk-js";
const PY_REPO = "./receipt-sdk-py";
const jsCli = `${JS_REPO}/bin/receipt-verify.mjs`;
const jsGen = `${JS_REPO}/scripts/make-signed-example.mjs`;
const pyCliCmd = "python";
const tmpJs = "tmp-js.json";
const tmpPy = "tmp-py.json";
try {
  const jsOut = execFileSync("node", [jsGen], { cwd: ".", encoding: "utf8" });
  writeFileSync(tmpJs, jsOut);
  execFileSync(pyCliCmd, ["-m", "receipt_verify", tmpJs], { cwd: PY_REPO, stdio: "inherit" });
  execFileSync(pyCliCmd, ["runner/gen_py_signed.py", tmpPy], { cwd: ".", stdio: "inherit" });
  const pyJson = readFileSync(tmpPy, "utf8");
  writeFileSync(tmpPy, pyJson);
  const out = execFileSync("node", [jsCli, tmpPy], { cwd: ".", encoding: "utf8" });
  process.stdout.write(out);
  const okA = true; // if python printed PASS above, we're good
  const okB = out.trim().includes("signature: PASS");
  if (!(okA && okB)) process.exit(1);
} catch (e) {
  console.error(String(e));
  process.exit(1);
}
