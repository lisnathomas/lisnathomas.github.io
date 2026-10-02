import type { ContactPoint, Practitioner } from 'fhir/r4';
import { formatJson } from '../lib/format-json';
import { education, isTodo, person } from './profile';

/**
 * Lisna's profile as a FHIR R4 Practitioner resource.
 *
 * Typed against the official R4 definitions (@types/fhir), so the build fails
 * if the structure drifts. The Playwright suite re-validates the JSON that is
 * actually rendered on the page.
 */
const telecom: ContactPoint[] = [
  { system: 'email', value: person.email },
  { system: 'url', value: person.github },
];

if (!isTodo(person.linkedin)) telecom.push({ system: 'url', value: person.linkedin });

export const practitioner: Practitioner = {
  resourceType: 'Practitioner',
  id: 'lisna-thomas',
  active: true,
  name: [
    {
      use: 'official',
      text: person.name,
      family: person.familyName,
      given: [person.givenName],
    },
  ],
  telecom,
  // Degrees are the qualifications FHIR R4 has in mind: "training, licenses or certification".
  qualification: education.map((e) => ({
    code: { text: e.degree },
    period: { start: e.start, end: e.end },
    issuer: { display: e.school },
  })),
};

export const practitionerJson = formatJson(practitioner);
