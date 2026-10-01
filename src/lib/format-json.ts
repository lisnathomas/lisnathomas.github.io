/**
 * Pretty-prints JSON like a human would: short arrays and objects stay on one
 * line, longer ones are expanded. Output is always valid JSON.
 */
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const inline = (value: Json): string => {
  if (Array.isArray(value)) return `[${value.map(inline).join(', ')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => `${JSON.stringify(k)}: ${inline(v)}`);
    return entries.length ? `{ ${entries.join(', ')} }` : '{}';
  }
  return JSON.stringify(value);
};

export function formatJson(value: unknown, maxWidth = 60, indent = 2): string {
  const walk = (node: Json, depth: number, prefixLength: number): string => {
    if (node === null || typeof node !== 'object') return JSON.stringify(node);

    const pad = ' '.repeat(indent * depth);
    const one = inline(node);
    if (pad.length + prefixLength + one.length <= maxWidth) return one;

    const inner = ' '.repeat(indent * (depth + 1));
    if (Array.isArray(node)) {
      const items = node.map((item) => inner + walk(item, depth + 1, 0));
      return `[\n${items.join(',\n')}\n${pad}]`;
    }

    const items = Object.entries(node).map(([key, child]) => {
      const keyText = `${JSON.stringify(key)}: `;
      return inner + keyText + walk(child, depth + 1, keyText.length);
    });
    return `{\n${items.join(',\n')}\n${pad}}`;
  };

  return walk(JSON.parse(JSON.stringify(value)) as Json, 0, 0);
}
