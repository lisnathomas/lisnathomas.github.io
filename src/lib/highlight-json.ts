/**
 * Build-time JSON syntax highlighter. Wraps tokens in <span class="j-*">
 * without changing the text, so the rendered textContent is still exactly
 * the original JSON (the tests parse it back).
 */
const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g;

export function highlightJson(json: string): string {
  let html = '';
  let last = 0;

  for (const match of json.matchAll(TOKEN)) {
    const [whole, str, colon, literal, num, punct] = match;
    html += escapeHtml(json.slice(last, match.index));

    if (str !== undefined) {
      const cls = colon ? 'j-key' : 'j-str';
      html += `<span class="${cls}">${escapeHtml(str)}</span>`;
      if (colon) html += `<span class="j-punct">${escapeHtml(colon)}</span>`;
    } else if (literal !== undefined) {
      html += `<span class="j-lit">${literal}</span>`;
    } else if (num !== undefined) {
      html += `<span class="j-num">${num}</span>`;
    } else if (punct !== undefined) {
      html += `<span class="j-punct">${escapeHtml(punct)}</span>`;
    }

    last = match.index + whole.length;
  }

  return html + escapeHtml(json.slice(last));
}
