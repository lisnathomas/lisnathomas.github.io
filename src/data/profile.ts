/**
 * Single source of truth for every fact shown on the site.
 *
 * Rules:
 * - Only facts supplied by Lisna live here. Nothing is invented.
 * - Anything still missing is a `todo(...)` placeholder. It renders on the
 *   page as a clearly marked [TODO: …] badge (never as a broken link) and is
 *   listed by `npm run todo` and in the README.
 */

export interface Todo {
  readonly todo: string;
}

export const todo = (label: string): Todo => ({ todo: label });

export const isTodo = (value: unknown): value is Todo =>
  typeof value === 'object' && value !== null && 'todo' in value;

export type Maybe<T> = T | Todo;

export const person = {
  name: 'Lisna Thomas',
  givenName: 'Lisna',
  familyName: 'Thomas',
  role: 'QA Engineer',
  headline: ['QA Engineer', 'Healthcare focus', 'AI-assisted test automation'],
  email: 'lisnathomas99@gmail.com',
  github: 'https://github.com/lisnathomas',
  linkedin: 'https://www.linkedin.com/in/lisna-thomas-137299261/' as Maybe<string>,
  resume: todo('resume PDF') as Maybe<string>,
  education: todo('Education') as Maybe<string>,
  siteRepo: 'https://github.com/lisnathomas/lisnathomas.github.io',
} as const;

export const heroSpec = {
  describe: 'Lisna Thomas, QA Engineer',
  tests: [
    'has 6+ years of QA experience',
    'speaks HL7 and FHIR',
    'automates with C#, Java, Playwright, Selenium and Reqnroll',
    'uses AI to test faster, and verifies every result',
  ],
} as const;

export const about = {
  paragraphs: [
    'QA Engineer with 6+ years of experience across healthcare IT, regulated gaming and enterprise web and mobile applications.',
    'Most recently at Altera Digital Health, where I was QA for a FHIR-based patient document exchange feature and part of the AI Champions group bringing AI into QA. I combine HL7 and FHIR domain knowledge with C# and Java test automation.',
    'My focus is healthcare, where accurate and secure patient data is the measure of quality.',
  ],
  domains: [
    { name: 'Healthcare', detail: 'EHR, HL7, FHIR' },
    { name: 'Regulated gaming', detail: 'certification testing' },
    { name: 'Client web and mobile applications', detail: null },
  ],
  qualifications: ['QA Engineering', 'Healthcare Interoperability (HL7, FHIR)'],
} as const;

export interface Stage {
  id: string;
  /** Short label used on the pipeline node. */
  name: string;
  role: string;
  dates: Maybe<string> | null;
  location?: string;
  description: string;
  bullets: readonly string[];
}

/** Ordered oldest to newest: the pipeline runs left to right. */
export const stages: readonly Stage[] = [
  {
    id: 'concentrix',
    name: 'Concentrix',
    role: 'QA Analyst',
    dates: 'June 2020 – July 2021',
    location: 'Chilliwack, BC',
    description: 'Global technology and customer experience services company',
    bullets: [
      "Automated 500+ test cases for a client's main web application",
      'Implemented Selenium and Java regression automation that cut regression run time by 60%; end-to-end tests with JUnit and TestNG',
      'Introduced Appium mobile test automation',
      'Automated smoke and regression tests in Katalon Studio; tested REST and SOAP APIs with Postman and SoapUI',
      'Validated data with SQL in SSMS, investigated logs in Splunk, compared UI against Figma designs',
      'Functional, exploratory, cross-browser and UAT testing; JIRA and Trello',
    ],
  },
  {
    id: 'gli',
    name: 'GLI',
    role: 'Test Engineer',
    dates: 'July 2021 – October 2022',
    description:
      'Gaming Laboratories International: independent testing and certification lab for casino, lottery, iGaming and sports betting products',
    bullets: [
      'Tested casino and iGaming games against approved game rules, paytables, payouts and jurisdictional technical standards for regulatory certification',
      'Built a Selenium WebDriver framework in Java and C# that cut manual testing effort by 50%, integrated into CI/CD pipelines to improve build and deployment efficiency by 40%',
      'Led adoption of API test automation with Postman, increasing test coverage by 25%',
      'Wrote complex SQL queries for database validation',
      'Tracked defects in JIRA and maintained a 98% on-time release rate across Agile and Waterfall projects',
    ],
  },
  {
    id: 'altera',
    name: 'Altera Digital Health',
    role: 'QA Engineer',
    dates: todo('dates'),
    description:
      'EHR and interoperability software for hospitals and health systems (formerly part of Allscripts)',
    bullets: [
      'AI Champion: helped build an AI testing tool that reviews requirements, runs test scenarios and commits test code; demoed it to business analysts',
      'QA for a 16-month project integrating an external API for cross-network patient document search, including subscription create, cancel and notification workflows; owned test design, automation and end-to-end testing through release',
      'Automated web UI tests with Selenium WebDriver, C#/.NET and Reqnroll (BDD/Gherkin), and desktop application tests with Appium',
      'Generated test cases from requirements with Claude, reviewing and refining them before they joined the suite',
      'Managed test plans, test cases and defects in Azure DevOps, integrated with Visual Studio and Git',
      'Validated HL7 messages and FHIR resources to confirm patient data moved accurately between systems',
      'Tested REST APIs with Postman and Swagger; validated backend data with SQL in SSMS',
      'Functional, regression, integration and end-to-end testing of clinical workflows in Agile/Scrum, protecting patient health information',
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio projects',
    role: 'AI-assisted test automation',
    dates: null,
    description: 'Open-source and collaborator projects where I build the test automation and the AI tooling',
    bullets: [
      'OpenMRS AI Test Automation: Playwright (C#) UI tests and FHIR R4 API tests against an open-source EMR, with evidence for every run',
      'School ERP AI Test Automation: Reqnroll + Playwright (C#) login suite across four user roles',
      'FeatureBot: an AI tool using the Claude API that turns user stories into Reqnroll feature files using only existing step definitions',
    ],
  },
];

export interface Result {
  value: string;
  label: string;
  context: string;
}

export const results: readonly Result[] = [
  { value: '50%', label: 'less manual testing effort', context: 'Selenium framework · GLI' },
  { value: '40%', label: 'better build and deployment efficiency', context: 'CI/CD integration · GLI' },
  { value: '25%', label: 'more test coverage', context: 'API automation with Postman · GLI' },
  { value: '60%', label: 'faster regression runs', context: 'Selenium and Java regression automation · Concentrix' },
  { value: '500+', label: 'test cases automated', context: "Client's main web application · Concentrix" },
  { value: '98%', label: 'on-time releases', context: 'Agile and Waterfall projects · GLI' },
  { value: '16-month', label: 'FHIR interoperability project', context: 'Cross-network patient document search · Altera Digital Health' },
];

export interface ProjectLink {
  label: string;
  href: Maybe<string>;
}

export interface Project {
  id: string;
  title: string;
  tag?: string;
  given: string;
  /** Optional placeholder rendered inline after the Given text. */
  givenTodo?: Todo;
  when: string;
  then: string;
  bullets: readonly string[];
  tech: readonly string[];
  links: readonly ProjectLink[];
}

export const projects: readonly Project[] = [
  {
    id: 'openmrs',
    title: 'OpenMRS AI Test Automation',
    tag: 'Healthcare',
    given: 'OpenMRS, an open-source electronic medical record system used by clinics worldwide',
    when: 'user stories are turned into BDD scenarios and run against the web UI and the FHIR API',
    then: 'patient data is verified to be accurate, consistent and secure, with evidence for every run',
    bullets: [
      'Playwright (C#) UI tests for the clinician login flow (username, password, clinic location), using page objects',
      'FHIR R4 API tests: capability statement, patient search, read-by-id consistency, search by family name, 404 OperationOutcome for unknown patients, and 401 access control without valid credentials',
      'Evidence for every run: videos with step captions and every checked element outlined, a PASSED/FAILED banner, Playwright traces for step-by-step replay, JSON files of every API request and response (password masked), and one HTML report per run',
      'FeatureBot, an AI tool using the Claude API, turns user stories into Reqnroll feature files using only existing step definitions, checks every step and keyword before tests run, and is reusable across projects through a config file',
      'Synthetic data only',
    ],
    tech: ['C#', '.NET', 'Playwright', 'Reqnroll', 'NUnit', 'FHIR R4', 'Claude API', 'Docker'],
    links: [
      { label: 'Code', href: 'https://github.com/lisnathomas/openmrs-ai-test-automation' },
      { label: 'Live test report', href: 'https://lisnathomas.github.io/openmrs-ai-test-automation/sample-run/report.html' },
      { label: 'Demo video', href: todo('OpenMRS demo video') },
    ],
  },
  {
    id: 'school-erp',
    title: 'School ERP AI Test Automation',
    given: 'a Laravel school management system with four roles (admin, teacher, student, parent), built by a developer collaborator',
    givenTodo: todo('collaborator name and repo link'),
    when: 'user stories are converted into BDD scenarios by FeatureBot',
    then: 'Playwright verifies each role lands on its own dashboard, and invalid logins are rejected with the right messages',
    bullets: [
      'I built all the test automation and the AI bot; the application was built by the collaborator',
      'Reqnroll + Playwright (C#) login suite across all four roles, including wrong-password, unknown-email and empty-form cases',
      'Video recorded for every scenario',
    ],
    tech: ['C#', 'Playwright', 'Reqnroll', 'NUnit', 'Claude API'],
    links: [
      { label: 'Code', href: todo('School ERP repo link') },
      { label: 'Demo video', href: todo('School ERP demo video') },
    ],
  },
];

export interface AiPrinciple {
  rule: string;
  title: string;
  body?: string;
}

export const aiPrinciples: readonly AiPrinciple[] = [
  { rule: 'existing-steps-only', title: 'AI drafts, the framework constrains', body: 'The bot may only use steps that already exist.' },
  { rule: 'verify-before-run', title: 'Every AI output is checked before anything runs.' },
  { rule: 'human-owns-risk', title: 'Humans own the risk decisions.' },
  { rule: 'synthetic-data-only', title: 'Synthetic data only, never real patient data.' },
];

export const skillGroups = [
  { name: 'Healthcare IT', items: ['HL7', 'FHIR R4', 'EHR systems', 'Interoperability', 'Clinical documents', 'PHI protection'] },
  {
    name: 'Test automation',
    items: ['Selenium WebDriver', 'Playwright', 'Appium', 'Reqnroll', 'BDD/Gherkin', 'Katalon Studio', 'NUnit', 'TestNG', 'JUnit', 'Page Object Model'],
  },
  { name: 'AI in testing', items: ['Claude', 'AI-assisted test generation', 'AI-driven requirement review', 'Prompt engineering'] },
  { name: 'Languages', items: ['C#', '.NET', 'Java', 'SQL'] },
  { name: 'API testing', items: ['Postman', 'Swagger', 'SoapUI', 'REST', 'SOAP'] },
  { name: 'Tools', items: ['Azure DevOps', 'JIRA', 'Visual Studio', 'Git', 'Docker', 'SSMS', 'Splunk', 'Figma', 'Trello'] },
  {
    name: 'Practices',
    items: ['Agile/Scrum', 'Waterfall', 'CI/CD', 'Functional', 'Regression', 'Integration', 'End-to-end', 'Exploratory', 'Cross-browser', 'UAT'],
  },
] as const;

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'results', label: 'Results' },
  { id: 'projects', label: 'Projects' },
  { id: 'ai', label: 'AI in testing' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const;
