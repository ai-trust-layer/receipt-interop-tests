
Reusable test suite that validates a candidate spec implementation against schema v1 + vectors.
- Input: path to receipt schema (JSON) from the spec repo.
- Output: `report.json` with pass/fail per vector; job fails if expectations not met.

See `.github/workflows/interop.yml` (workflow_call). Call it from your spec repo.
