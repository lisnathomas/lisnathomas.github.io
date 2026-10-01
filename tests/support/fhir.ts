/**
 * A small structural validator for the FHIR R4 Practitioner resource shown on
 * the page. It checks the rules that matter for this resource (element names,
 * cardinality, datatypes, value sets and the JSON representation rules),
 * so a typo like "telecomm" or an empty array fails the build.
 * Spec: https://hl7.org/fhir/R4/practitioner.html and https://hl7.org/fhir/R4/json.html
 */

type Json = unknown;

const PRACTITIONER_ELEMENTS = new Set([
  'resourceType', 'id', 'meta', 'implicitRules', 'language', 'text', 'contained', 'extension',
  'modifierExtension', 'identifier', 'active', 'name', 'telecom', 'address', 'gender', 'birthDate',
  'photo', 'qualification', 'communication',
]);
const HUMAN_NAME = new Set(['id', 'extension', 'use', 'text', 'family', 'given', 'prefix', 'suffix', 'period']);
const CONTACT_POINT = new Set(['id', 'extension', 'system', 'value', 'use', 'rank', 'period']);
const QUALIFICATION = new Set(['id', 'extension', 'modifierExtension', 'identifier', 'code', 'period', 'issuer']);
const CODEABLE_CONCEPT = new Set(['id', 'extension', 'coding', 'text']);

const NAME_USE = ['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden'];
const CONTACT_SYSTEM = ['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'];
const CONTACT_USE = ['home', 'work', 'temp', 'old', 'mobile'];

const isObject = (v: Json): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function validatePractitioner(resource: Json): string[] {
  const errors: string[] = [];
  const fail = (path: string, msg: string) => errors.push(`${path}: ${msg}`);

  // JSON representation rules: no nulls, no empty strings, arrays or objects.
  const walk = (v: Json, path: string) => {
    if (v === null) fail(path, 'null is not allowed');
    else if (typeof v === 'string' && v.trim() === '') fail(path, 'empty string');
    else if (Array.isArray(v)) {
      if (v.length === 0) fail(path, 'empty array');
      v.forEach((item, i) => walk(item, `${path}[${i}]`));
    } else if (isObject(v)) {
      if (Object.keys(v).length === 0) fail(path, 'empty object');
      for (const [k, child] of Object.entries(v)) walk(child, `${path}.${k}`);
    }
  };
  walk(resource, 'Practitioner');

  if (!isObject(resource)) return ['Practitioner: not a JSON object'];

  const known = (obj: Record<string, Json>, allowed: Set<string>, path: string) => {
    for (const key of Object.keys(obj)) if (!allowed.has(key)) fail(path, `unknown element "${key}"`);
  };
  const string = (v: Json, path: string) => typeof v === 'string' || fail(path, 'must be a string');
  const array = (v: Json, path: string): Json[] => (Array.isArray(v) ? v : (fail(path, 'must be an array'), []));
  const code = (v: Json, allowed: string[], path: string) =>
    (typeof v === 'string' && allowed.includes(v)) || fail(path, `must be one of ${allowed.join('|')}`);

  known(resource, PRACTITIONER_ELEMENTS, 'Practitioner');
  if (resource['resourceType'] !== 'Practitioner') fail('resourceType', 'must be "Practitioner"');
  if ('id' in resource && !(typeof resource['id'] === 'string' && /^[A-Za-z0-9\-.]{1,64}$/.test(resource['id']))) {
    fail('id', 'must match [A-Za-z0-9-.]{1,64}');
  }
  if ('active' in resource && typeof resource['active'] !== 'boolean') fail('active', 'must be a boolean');

  array(resource['name'] ?? [], 'name').forEach((n, i) => {
    const p = `name[${i}]`;
    if (!isObject(n)) {
      fail(p, 'must be a HumanName object');
      return;
    }
    known(n, HUMAN_NAME, p);
    if ('use' in n) code(n['use'], NAME_USE, `${p}.use`);
    if ('text' in n) string(n['text'], `${p}.text`);
    if ('family' in n) string(n['family'], `${p}.family`);
    if ('given' in n) array(n['given'], `${p}.given`).forEach((g, j) => string(g, `${p}.given[${j}]`));
  });

  array(resource['telecom'] ?? [], 'telecom').forEach((t, i) => {
    const p = `telecom[${i}]`;
    if (!isObject(t)) {
      fail(p, 'must be a ContactPoint object');
      return;
    }
    known(t, CONTACT_POINT, p);
    if ('system' in t) code(t['system'], CONTACT_SYSTEM, `${p}.system`);
    if ('use' in t) code(t['use'], CONTACT_USE, `${p}.use`);
    if ('value' in t) string(t['value'], `${p}.value`);
    // cpt-2: a system is required if a value is provided
    if ('value' in t && !('system' in t)) fail(p, 'cpt-2: system is required when value is present');
  });

  array(resource['qualification'] ?? [], 'qualification').forEach((q, i) => {
    const p = `qualification[${i}]`;
    if (!isObject(q)) {
      fail(p, 'must be an object');
      return;
    }
    known(q, QUALIFICATION, p);
    const c = q['code'];
    if (!isObject(c)) {
      fail(`${p}.code`, 'is required (1..1) and must be a CodeableConcept');
      return;
    }
    known(c, CODEABLE_CONCEPT, `${p}.code`);
    if (!('text' in c) && !('coding' in c)) fail(`${p}.code`, 'needs text or coding');
    if ('text' in c) string(c['text'], `${p}.code.text`);
  });

  return errors;
}
