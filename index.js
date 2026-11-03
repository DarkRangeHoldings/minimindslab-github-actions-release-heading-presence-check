import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

if (typeof payloadRaw !== 'string' || payloadRaw.length === 0) {
  throw new Error('Invalid input: INPUT_PAYLOAD must be a non-empty JSON string');
}
if (typeof outputPath !== 'string' || outputPath.length === 0) {
  throw new Error('Invalid environment: GITHUB_OUTPUT is required');
}

let parsed;
try {
  parsed = JSON.parse(payloadRaw);
} catch {
  throw new Error('Invalid input: INPUT_PAYLOAD must be valid JSON');
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  throw new Error('Invalid input: payload must be an object');
}

const hasOnlyTextAndVersion =
  Object.prototype.hasOwnProperty.call(parsed, 'text') &&
  Object.prototype.hasOwnProperty.call(parsed, 'version') &&
  Object.keys(parsed).length === 2;

if (!hasOnlyTextAndVersion) {
  throw new Error('Invalid input: payload must contain exactly text and version');
}

const text = parsed.text;
const version = parsed.version;

if (typeof text !== 'string') {
  throw new Error('Invalid input: text must be a string');
}
if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error('Invalid input: version must match digits.digits.digits');
}

const heading = `## ${version}`;
const lines = text.split(/\r?\n/);
let found = false;

for (let i = 0; i < lines.length; i += 1) {
  if (lines[i].trim() === heading) {
    found = true;
    break;
  }
}

const result = JSON.stringify({ found, heading });
appendFileSync(outputPath, `result=${result}\n`);