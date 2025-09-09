import json, hashlib, subprocess, sys, urllib.request, os, tempfile, pathlib

SCHEMA_URL = os.getenv("SCHEMA_URL", "https://raw.githubusercontent.com/ai-trust-layer/receipt-spec/v1.0.3/schema/receipt.schema.json")
OK_URL     = os.getenv("OK_URL",     "https://raw.githubusercontent.com/ai-trust-layer/receipt-spec/v1.0.3/examples/ok.json")

ROOT = pathlib.Path.cwd()
TMP  = ROOT / "tmp"
TMP.mkdir(exist_ok=True)

# 1) Fixtures
(IN, OUT) = (TMP/"in.txt", TMP/"out.txt")
IN.write_text("hello input")
OUT.write_text("hello output")

# 2) Download base receipt + schema
(schema_path, base_path) = (TMP/"schema.json", TMP/"ok.json")
urllib.request.urlretrieve(SCHEMA_URL, schema_path)
urllib.request.urlretrieve(OK_URL, base_path)

# 3) Inject hashes in ok-local.json
ih = hashlib.sha256(IN.read_bytes()).hexdigest()
oh = hashlib.sha256(OUT.read_bytes()).hexdigest()
rec = json.loads(base_path.read_text())
rec["input_hash"]  = f"sha256:{ih}"
rec["output_hash"] = f"sha256:{oh}"
ok_local = TMP/"ok-local.json"
ok_local.write_text(json.dumps(rec))

def run_verify(in_path, out_path, expect_pass: bool):
    cmd = [
        sys.executable, "-m", "receipt_verify", "verify",
        str(ok_local), "--schema", str(schema_path),
        "--input", str(in_path), "--output", str(out_path),
    ]
    env = os.environ.copy()
    env["PYTHONPATH"] = "sdk-py"
    print("RUN:", " ".join(cmd))
    p = subprocess.run(cmd, env=env, capture_output=True, text=True)
    print(p.stdout)
    if (p.returncode == 0) != expect_pass:
        print("FAIL: unexpected result (exit={})".format(p.returncode))
        print(p.stderr)
        sys.exit(1)

# Case A: should PASS
run_verify(IN, OUT, expect_pass=True)

# Case B: BLOCKED (change output)
OUT_BAD = TMP/"out-bad.txt"
OUT_BAD.write_text("tampered output")
run_verify(IN, OUT_BAD, expect_pass=False)

print("ALL TESTS PASS")
