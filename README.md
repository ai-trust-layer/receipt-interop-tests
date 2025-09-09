# Receipt Interop Tests

![Interop CI](https://github.com/ai-trust-layer/receipt-interop-tests/actions/workflows/ci.yml/badge.svg)

Minimal end-to-end tests that verify receipt compliance using the Python SDK.

- Pulls schema + example from `receipt-spec@v1.0.3`
- Generates hashes for input/output
- **PASS** case and **BLOCKED** (tampered) case
