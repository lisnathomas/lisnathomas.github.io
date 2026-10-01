/**
 * Builds the "Open a ticket" mailto: link. Shared by the page (for the
 * no-JS fallback) and the browser script, and covered by the Playwright suite.
 */
export interface Ticket {
  summary: string;
  details: string;
  expected: string;
}

export const DEFAULT_SUBJECT = 'Ticket from your portfolio';

/** RFC 6068: line breaks in a mailto body must be encoded as CRLF. */
const CRLF = '\r\n';

const multiline = (text: string) => text.trim().replace(/\r?\n/g, CRLF);
const oneLine = (text: string) => text.trim().replace(/\s+/g, ' ');

export function buildMailto(email: string, ticket: Ticket): string {
  const summary = oneLine(ticket.summary);
  const subject = summary ? `[Ticket] ${summary}` : DEFAULT_SUBJECT;
  const body = [
    'Summary',
    summary,
    '',
    'Details',
    multiline(ticket.details),
    '',
    'Expected outcome',
    multiline(ticket.expected),
  ].join(CRLF);

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
