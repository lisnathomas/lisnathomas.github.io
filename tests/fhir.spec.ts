import { EMAIL, expect, test } from './support/fixtures';
import { validatePractitioner } from './support/fhir';

test.describe('View as FHIR', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#about');
  });

  test('the switch swaps the profile card for the FHIR resource and back', async ({ page }) => {
    const fhirSwitch = page.getByRole('switch', { name: 'View as FHIR' });
    const card = page.getByTestId('profile-card');
    const fhir = page.getByTestId('profile-fhir');

    await expect(fhirSwitch).toHaveAttribute('aria-checked', 'false');
    await expect(card).toBeVisible();
    await expect(fhir).toBeHidden();

    await fhirSwitch.click();
    await expect(fhirSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(fhir).toBeVisible();
    await expect(card).toBeHidden();
    await expect(fhir).toContainText('My profile, as a healthcare system would see it.');

    await fhirSwitch.click();
    await expect(fhirSwitch).toHaveAttribute('aria-checked', 'false');
    await expect(card).toBeVisible();
    await expect(fhir).toBeHidden();
  });

  test('the switch works from the keyboard', async ({ page }) => {
    const fhirSwitch = page.getByRole('switch', { name: 'View as FHIR' });
    await fhirSwitch.focus();
    await page.keyboard.press('Space');
    await expect(fhirSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('profile-fhir')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(fhirSwitch).toHaveAttribute('aria-checked', 'false');
  });

  test('the JSON is valid and is a structurally valid FHIR R4 Practitioner', async ({ page }) => {
    await page.getByRole('switch', { name: 'View as FHIR' }).click();
    const text = await page.locator('[data-fhir-json]').textContent();

    let resource: Record<string, any>;
    expect(() => (resource = JSON.parse(text ?? '')), 'rendered JSON parses').not.toThrow();
    resource = JSON.parse(text ?? '');

    expect(validatePractitioner(resource)).toEqual([]);

    expect(resource['resourceType']).toBe('Practitioner');
    expect(resource['name'][0]).toMatchObject({ family: 'Thomas', given: ['Lisna'] });
    expect(resource['telecom']).toContainEqual({ system: 'email', value: EMAIL });
    expect(resource['telecom'].some((t: { system: string }) => t.system === 'phone')).toBe(false);

    const qualifications = resource['qualification'].map((q: { code: { text: string } }) => q.code.text);
    expect(qualifications.join(' ')).toMatch(/QA Engineering/);
    expect(qualifications.join(' ')).toMatch(/Interoperability/);
  });

  test('syntax highlighting does not change the JSON text', async ({ page }) => {
    await page.getByRole('switch', { name: 'View as FHIR' }).click();
    const code = page.locator('[data-fhir-json]');
    await expect(code.locator('.j-key').first()).toBeVisible();
    // Keys, strings and punctuation are coloured differently.
    const [key, str] = await Promise.all([
      code.locator('.j-key').first().evaluate((el) => getComputedStyle(el).color),
      code.locator('.j-str').first().evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(key).not.toBe(str);
  });
});

test.describe('View as FHIR validator', () => {
  test('rejects broken resources (the validator itself is tested)', () => {
    expect(validatePractitioner({ resourceType: 'Patient' })).toContain('resourceType: must be "Practitioner"');
    expect(validatePractitioner({ resourceType: 'Practitioner', telecomm: [] }).join()).toMatch(/unknown element "telecomm"/);
    expect(validatePractitioner({ resourceType: 'Practitioner', name: [] }).join()).toMatch(/empty array/);
    expect(validatePractitioner({ resourceType: 'Practitioner', qualification: [{}] }).join()).toMatch(/code: is required/);
    expect(validatePractitioner({ resourceType: 'Practitioner', telecom: [{ value: 'x' }] }).join()).toMatch(/cpt-2/);
  });
});
