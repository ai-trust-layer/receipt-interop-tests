import sys, base64, json
from nacl.signing import SigningKey
from receipt_verify.signature import canonicalize_subset
PRIV_HEX="01"*32
r={"id":"rec_py_cli_001","issued_at":"2025-09-10T12:00:00Z","input_hash":"a"*64,"output_hash":"b"*64,"model_version":"gpt-x-2025-09-01","policy_version":"policy-v1.0"}
sk=SigningKey(bytes.fromhex(PRIV_HEX)); vk=sk.verify_key
msg=canonicalize_subset(r).encode("utf-8"); sig=sk.sign(msg).signature
r["signature"]={"alg":"ed25519","kid":"ed25519:"+vk.encode().hex(),"sig":base64.b64encode(sig).decode("ascii")}
open(sys.argv[1],"w").write(json.dumps(r))
