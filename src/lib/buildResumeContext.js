// Pure ESM module — no React imports — safe to import from the Netlify Edge Function.
// Reads from src/data/*.js (single source of truth) and serializes to plain text
// that gets embedded in the LLM system prompt.

import { experience } from '../data/experience.js';
import { projects } from '../data/projects.js';
import { skillCategories } from '../data/skills.js';
import { education } from '../data/education.js';

const PROFILE = {
  name: 'Rohit Biswas',
  location: 'New York, NY',
  current_role: 'Systems Engineer at Columbia Technology Ventures · CS Student at Columbia University',
  passions: ['software development', 'hardware', 'cybersecurity'],
  awards: [
    'DevFest 2026 Winner (YC Interview)',
    'MLH Award @ DivHacks 2025',
    '3rd Place @ MakeCU',
  ],
  stats: { years_coding: '4+', projects_built: '10+', hackathon_wins: 3 },
};

const formatList = (items) => items.map((item) => `  - ${item}`).join('\n');

const formatProfile = () => {
  const lines = [
    '## PROFILE',
    `Name: ${PROFILE.name}`,
    `Location: ${PROFILE.location}`,
    `Current: ${PROFILE.current_role}`,
    `Passions: ${PROFILE.passions.join(', ')}`,
    'Notable awards:',
    formatList(PROFILE.awards),
    `Years coding: ${PROFILE.stats.years_coding}`,
    `Projects built: ${PROFILE.stats.projects_built}`,
    `Hackathon wins: ${PROFILE.stats.hackathon_wins}`,
  ];
  return lines.join('\n');
};

const formatEducation = () => {
  const entries = education.map((edu) => {
    const status = edu.current ? ' (current)' : '';
    return `- ${edu.degree} — ${edu.institution}, ${edu.location} — ${edu.period}${status}`;
  });
  return ['## EDUCATION', ...entries].join('\n');
};

const formatSkills = () => {
  const blocks = skillCategories.map((category) => {
    return `${category.title}: ${category.skills.join(', ')}`;
  });
  return ['## SKILLS', ...blocks].join('\n');
};

const formatExperience = () => {
  const entries = experience.map((job) => {
    const status = job.current ? ' (current)' : '';
    const bullets = job.description.map((line) => `    * ${line}`).join('\n');
    const tech = job.technologies.length > 0
      ? `    Tech: ${job.technologies.join(', ')}`
      : '';
    return [
      `- ${job.role} @ ${job.company} (${job.location}) — ${job.period}${status}`,
      bullets,
      tech,
    ].filter(Boolean).join('\n');
  });
  return ['## EXPERIENCE', ...entries].join('\n');
};

const formatProjects = () => {
  const entries = projects.map((project) => {
    const award = project.award ? ` [${project.award}]` : '';
    const tags = project.tags.length > 0 ? `\n    Tech: ${project.tags.join(', ')}` : '';
    return `- ${project.title}${award}\n    ${project.description}${tags}`;
  });
  return ['## PROJECTS', ...entries].join('\n');
};

/**
 * Returns a plain-text serialization of Rohit's full resume context,
 * suitable for embedding in an LLM system prompt.
 */
export function getResumeContextText() {
  return [
    formatProfile(),
    '',
    formatEducation(),
    '',
    formatSkills(),
    '',
    formatExperience(),
    '',
    formatProjects(),
  ].join('\n');
}
