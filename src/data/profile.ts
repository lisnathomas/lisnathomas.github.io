/**
 * Single source of truth for every fact shown on the site.
 *
 * Rules:
 * - Every fact comes from Lisna's resume (public/Lisna_Thomas_Resume.pdf).
 *   Nothing is invented.
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
  resume: '/Lisna_Thomas_Resume.pdf' as Maybe<string>,
  siteRepo: 'https://github.com/lisnathomas/lisnathomas.github.io',
} as const;

export interface Degree {
  degree: string;
  school: string;
  place: string;
  dates: string;
  /** FHIR dateTime values (YYYY or YYYY-MM) for the Practitioner resource. */
  start: string;
  end: string;
}

export const education: readonly Degree[] = [
  {
    degree: 'Bachelor of Computer Information Systems',
    school: 'University of the Fraser Valley',
    place: 'Abbotsford, BC',
    dates: 'September 2018 – April 2020',
    start: '2018-09',
    end: '2020-04',
  },
  {
    degree: "Bachelor's degree in Computer Science",
    school: 'Mahatma Gandhi University',
    place: 'Kerala, India',
    dates: '2015 – 2018',
    start: '2015',
    end: '2018',
  },
];

export const heroSpec = {
  describe: 'Lisna Thomas, QA Engineer',
  tests: [
    'has 6+ years of QA experience',
    'speaks HL7 and FHIR',
    'automates with Playwright, Selenium, Appium and Reqnroll',
    'uses AI agents to test faster, and validates their output',
  ],
} as const;

export const about = {
  paragraphs: [
    'Software QA engineer with 6+ years of experience in manual and automated testing across digital health, regulated gaming (web, iOS and Android) and client web applications.',
    'Most recently at Altera Digital Health, where I was one of the AI Champions who built an AI agent workflow that turns requirements into BDD tests, runs them with Playwright and commits the code.',
    'I verify features against design specs, Figma designs and acceptance criteria, manage the bug backlog in Jira and Azure DevOps, and read and write code in C#, Java, JavaScript and SQL. My focus is healthcare, where accurate and secure patient data is the measure of quality.',
  ],
  domains: [
    { name: 'Healthcare', detail: 'EHR, HL7, FHIR' },
    { name: 'Regulated gaming', detail: 'web, iOS and Android certification testing' },
    { name: 'Client web applications', detail: null },
  ],
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
    dates: 'August 2020 – October 2022',
    location: 'Chilliwack, BC',
    description: 'Global technology and customer experience services company; manual testing of client web applications',
    bullets: [
      'Reviewed requirements and user stories, and wrote detailed test scenarios and test cases',
      'Performed manual functional, smoke, sanity, regression, exploratory, cross-browser, UAT and release testing of client web applications, with a focus on edge cases',
      'Compared built screens against Figma designs to catch layout and design differences',
      'Tested REST and SOAP APIs with Postman and SoapUI, validated backend data with SQL in SSMS, and investigated application logs in Splunk',
      'Logged, tracked and retested defects in JIRA with clear steps to reproduce, screenshots and expected vs actual results; tracked team tasks in Trello',
      'Worked with developers, business analysts and client teams in Agile/Scrum',
    ],
  },
  {
    id: 'gli',
    name: 'GLI',
    role: 'Test Engineer',
    dates: 'October 2022 – March 2025',
    location: 'Burnaby, BC',
    description: 'Independent testing and certification lab for casino, lottery, iGaming and sports betting products',
    bullets: [
      'Verified games in detail against approved rules, paytables, payouts and jurisdictional technical standards before certification',
      'Tested iGaming games on iOS and Android, covering edge cases in game play, payouts and bonus features',
      'Built end-to-end and cross-browser UI automation with Playwright and Selenium WebDriver in Java and C#',
      'Designed a Selenium WebDriver framework with TestNG and JUnit that cut manual testing effort by 50%',
      'Integrated automated tests into CI/CD pipelines, improving build and deployment efficiency by 40%',
      'Led adoption of API test automation with Postman, increasing test coverage by 25%',
      'Logged and tracked defects in JIRA and maintained a 98% on-time release rate across Agile and Waterfall projects',
    ],
  },
  {
    id: 'altera',
    name: 'Altera Digital Health',
    role: 'QA Engineer',
    dates: 'March 2025 – October 2026',
    location: 'Remote, Canada',
    description:
      'EHR and interoperability software for hospitals and health systems (formerly part of Allscripts)',
    bullets: [
      "AI agents: As one of Altera's AI Champions, co-built an AI agent workflow (Claude) that reads requirements, generates Reqnroll feature files, runs the tests with Playwright, commits and pushes the test code, and produces a demo of the results",
      "Demoed the AI agent workflow to business analysts, helping bring AI into the team's QA process; the workflow cut test-case writing time by 70% per story and reduced manual testing to about 20% of its previous effort through automation",
      'Used Claude as an AI coding agent to generate test cases from user stories, write automation scripts and handle Git commits and pushes, integrated with Azure DevOps and Visual Studio',
      'Verified clinical features against requirements and acceptance criteria, catching gaps between what was specified and what was built before release',
      'QA for a 16-month feature integrating an external API for cross-network patient document search, with subscription create, cancel and notification workflows; owned test design, automation and end-to-end testing through release',
      'Maintained automated UI tests with Selenium WebDriver, C#/.NET and Reqnroll (BDD), and automated desktop application tests with Appium, investigating failures and fixing flaky tests',
      'Managed the bug backlog in Azure DevOps: reproduced, documented and tracked defects to resolution',
      'Tested REST APIs with Postman and Swagger, validated data with SQL in SSMS, and validated HL7 messages and FHIR resources while protecting patient health information (PHI)',
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio projects',
    role: 'AI-assisted test automation',
    dates: null,
    description: 'Personal projects: test automation for an open-source EMR and for a web app built by a developer collaborator',
    bullets: [
      'OpenMRS AI Test Automation: Playwright (C#) UI tests for the clinician login flow and FHIR R4 API tests for patient search, data consistency and access control, in one Reqnroll (BDD) suite',
      'Every run saves captioned videos, Playwright traces for step-by-step replay, and every API request and response, so a failing test can be investigated instead of blindly re-run',
      'An AI bot (Claude API) that turns user stories into BDD scenarios using only existing steps, and checks every step before tests run',
      'School ERP AI Test Automation: a Playwright login suite covering four user roles for a school management web app built by a developer collaborator',
    ],
  },
];

export interface Result {
  value: string;
  label: string;
  context: string;
}

export const results: readonly Result[] = [
  {
    value: '70%',
    label: 'less time writing test cases per story, with manual testing reduced to about 20% of its previous effort',
    context: 'AI agent workflow · Altera Digital Health',
  },
  { value: '16-month', label: 'interoperability feature', context: 'Cross-network patient document search · Altera Digital Health' },
  { value: '50%', label: 'less manual testing effort', context: 'Selenium framework · GLI' },
  { value: '40%', label: 'better build and deployment efficiency', context: 'CI/CD integration · GLI' },
  { value: '25%', label: 'more test coverage', context: 'API automation with Postman · GLI' },
  { value: '98%', label: 'on-time releases', context: 'Agile and Waterfall projects · GLI' },
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
  /** Optional credit linked at the end of the Given text, e.g. who built the app under test. */
  givenCredit?: { name: string; href: string };
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
    then: 'patient search, data consistency and access control are verified, with evidence saved for every run',
    bullets: [
      'Built Playwright (C#) UI tests for the clinician login flow and FHIR R4 API tests for patient search, data consistency and access control, in one Reqnroll (BDD) suite',
      'Designed the suite for fast failure diagnosis: every run saves captioned videos, Playwright traces for step-by-step replay, and every API request and response, so a failing test can be investigated instead of blindly re-run',
      'Used user-facing locators and automatic waiting to keep tests stable, and debugged real environment and build issues across Docker, framework updates and file locks',
      'Built an AI bot (Claude API) that turns user stories into BDD scenarios using only existing steps, and checks every step before tests run',
      'Synthetic data only',
    ],
    tech: ['C#', 'Playwright', 'Reqnroll', 'FHIR R4', 'Docker', 'Claude API'],
    links: [
      { label: 'Code', href: 'https://github.com/lisnathomas/openmrs-ai-test-automation' },
      { label: 'Live test report', href: 'https://openmrs-ai-test-automation.vercel.app' },
    ],
  },
  {
    id: 'school-erp',
    title: 'School ERP AI Test Automation',
    given: 'a school management web app with four user roles, built by',
    givenCredit: { name: 'Richu Thankachan', href: 'https://github.com/coderaticebear/school_erp' },
    when: 'each of the four roles logs in',
    then: 'a Playwright login suite verifies the login for every role',
    bullets: [
      'Playwright login suite covering all four user roles',
      'I built the test automation; the app itself is the work of a developer collaborator',
    ],
    tech: ['Playwright'],
    links: [
      { label: 'Code', href: 'https://github.com/lisnathomas/school-erp-ai-test-automation' },
      { label: 'Live test report', href: 'https://school-erp-ai-test-automation-docs.vercel.app/sample-run/report.html' },
    ],
  },
];

/** Opens the "How I use AI in testing" section. */
export const aiIntro =
  'At Altera Digital Health, I was one of the AI Champions who co-built an AI agent workflow that reads requirements, generates Gherkin feature files, runs them with Playwright and commits the code, cutting test-case writing time by 70% per story. AI helps me test faster. These four rules keep it honest.';

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

/** The resume's skill groups, with digital health first (it leads the section). */
export const skillGroups = [
  {
    name: 'Digital health',
    items: ['HL7', 'FHIR R4', 'EHR systems', 'Healthcare interoperability', 'Patient data privacy (PHI)'],
  },
  {
    name: 'Test automation',
    items: [
      'Playwright',
      'Selenium WebDriver',
      'Appium (desktop applications)',
      'Reqnroll (SpecFlow successor)',
      'BDD/Gherkin',
      'Katalon Studio',
      'NUnit',
      'TestNG',
      'JUnit',
      'Page Object Model',
      'End-to-end (E2E) testing',
    ],
  },
  {
    name: 'AI in testing',
    items: [
      'AI agents',
      'Agentic test automation workflows',
      'Claude',
      'Claude API',
      'AI-generated test cases',
      'AI-driven requirement review',
      'Prompt engineering',
      'Validating AI output',
    ],
  },
  { name: 'Programming', items: ['C#', '.NET', 'Java', 'JavaScript', 'React Native', 'SQL'] },
  {
    name: 'Bug tracking and specs',
    items: [
      'Jira',
      'Azure DevOps (Boards, Test Plans)',
      'Figma',
      'Design specs',
      'Acceptance criteria',
      'Bug backlog management',
      'Defect triage',
      'Clear bug reports with evidence',
    ],
  },
  { name: 'CI/CD and tools', items: ['CI/CD pipelines', 'Git', 'GitHub', 'Docker', 'Visual Studio', 'Splunk'] },
  { name: 'API and data', items: ['REST and SOAP APIs', 'Postman', 'Swagger', 'SoapUI', 'SQL Server (SSMS)', 'JSON'] },
  {
    name: 'Testing types',
    items: [
      'Functional',
      'Regression',
      'Smoke',
      'Sanity',
      'Integration',
      'End-to-end',
      'Exploratory',
      'Edge-case',
      'Cross-browser',
      'iOS and Android mobile',
      'Desktop',
      'API',
      'Database',
      'UAT',
      'Release',
    ],
  },
  { name: 'Methodologies', items: ['Agile/Scrum', 'Waterfall', 'SDLC', 'STLC'] },
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
