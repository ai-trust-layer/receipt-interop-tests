import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const schemaPath = process.env.SCHEMA;
if (!schemaPath) { console.error("SCHEMA env var required"); process.exit(2); }

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vectors', 'manifest.json'), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const vectorsDir = path.join(__dirname, '..', 'vectors');
const files = Object.keys(manifest);

let allOk = true;
const results = [];

for (const f of files) {
  const data = JSON.parse(fs.readFileSync(path.join(vectorsDir, f), 'utf8'));
  const valid = validate(data);
  const expect = manifest[f] === 'pass';
  const ok = (valid === expect);
  if (!ok) allOk = false;
  results.push({ file: f, valid, expect, ok, errors: valid ? [] : validate.errors });
}

fs.writeFileSync(path.join(__dirname, '..', 'report.json'), JSON.stringify({ allOk, results }, null, 2));
console.log(JSON.stringify({ allOk, summary: results.map(r => ({file:r.file, ok:r.ok})) }, null, 2));
process.exit(allOk ? 0 : 1);
