import { execSync } from "node:child_process";

function sh(cmd) {
  console.log("$ " + cmd);
  execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
}

try {
  sh("node receipt-sdk-js/scripts/make-signed-example.mjs > tmp-js.json");
  sh("python3 receipt-sdk-py/scripts/verify_ed25519_real.py tmp-js.json");

  sh("python3 receipt-sdk-py/scripts/make_signed_ed25519.py tmp-py.json");
  sh("node receipt-sdk-js/scripts/verify_ed25519_real.mjs tmp-py.json");

  console.log("Interop: PASS");
} catch (e) {
  console.error("Interop: FAIL");
  process.exit(1);
}
