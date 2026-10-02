/**
 * Lists every content placeholder still waiting for a real value.
 * Usage: npm run todo
 */
import { readFileSync } from 'node:fs';

const file = 'src/data/profile.ts';
const lines = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').split('\n');
const found = [];

lines.forEach((line, i) => {
  for (const match of line.matchAll(/todo\('([^']+)'\)/g)) found.push(`${file}:${i + 1}  [TODO: ${match[1]}]`);
});

if (found.length === 0) {
  console.log('No placeholders left. Every fact on the site is real.');
} else {
  console.log(`${found.length} placeholder(s) left:\n`);
  console.log(found.join('\n'));
}
