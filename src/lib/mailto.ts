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

export function buildMailto(email: string, ticket: Ticket): string {
  const summary = ticket.summary.trim();
  const subject = summary ? `[Ticket] ${summary}` : DEFAULT_SUBJECT;
  const body = [
    'Summary',
    summary,
    '',
    'Details',
    ticket.details.trim(),
    '',
    'Expected outcome',
    ticket.expected.trim(),
  ].join(CRLF);

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
