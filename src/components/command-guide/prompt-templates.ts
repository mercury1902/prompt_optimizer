export interface PromptTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;
}

export type TemplateCategory =
  | 'Development'
  | 'UI/UX'
  | 'DevOps'
  | 'Database';

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Development',
  'UI/UX',
  'DevOps',
  'Database',
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Development
  {
    id: 'dev-feature',
    name: 'Implement Feature',
    category: 'Development',
    description: 'Request implementation of a new feature',
    content:
      "Implement [feature name] with proper error handling, TypeScript types, and unit tests. Include validation, loading states, and follow the project's existing patterns.",
  },
  {
    id: 'dev-refactor',
    name: 'Refactor Code',
    category: 'Development',
    description: 'Refactor existing code for better quality',
    content:
      'Refactor [component/function name] to improve readability, reduce complexity, and enhance maintainability. Extract reusable functions, add proper types, and ensure all tests pass.',
  },
  {
    id: 'dev-debug',
    name: 'Debug Issue',
    category: 'Development',
    description: 'Help debug an error or issue',
    content:
      'Debug the following issue: [describe error]. The error occurs when [steps to reproduce]. Check for null references, async handling, state management issues, and provide a fix with explanation.',
  },
  {
    id: 'dev-review',
    name: 'Code Review',
    category: 'Development',
    description: 'Request code review feedback',
    content:
      'Review this code for: best practices, performance issues, security vulnerabilities, and maintainability. Suggest specific improvements with code examples.',
  },

  // UI/UX
  {
    id: 'ui-component',
    name: 'Create Component',
    category: 'UI/UX',
    description: 'Build a reusable UI component',
    content:
      'Create a [component name] component with props for [list props]. Include Storybook stories, responsive styles, accessibility attributes, and glassmorphism design matching the existing theme.',
  },
  {
    id: 'ui-page',
    name: 'Design Page',
    category: 'UI/UX',
    description: 'Design a complete page layout',
    content:
      'Design a [page name] page with: header, main content area, sidebar (optional), and footer. Use the existing color scheme (gray-900/gray-800 + brand accent only), glassmorphism effects, and responsive breakpoints.',
  },
  {
    id: 'ui-animation',
    name: 'Add Animations',
    category: 'UI/UX',
    description: 'Add animations and transitions',
    content:
      'Add smooth animations for: page transitions, hover effects, loading states, and scroll reveals. Use Framer Motion or CSS transitions, keep it subtle and professional.',
  },
  {
    id: 'ui-responsive',
    name: 'Responsive Design',
    category: 'UI/UX',
    description: 'Make design responsive',
    content:
      'Make [component/page] fully responsive: mobile-first approach, breakpoints at sm/md/lg/xl, touch-friendly targets, and test on different screen sizes.',
  },

  // DevOps
  {
    id: 'ops-deploy',
    name: 'Deploy Config',
    category: 'DevOps',
    description: 'Setup deployment configuration',
    content:
      'Setup deployment for [platform - Vercel/Netlify/AWS/etc.] with: environment variables, build configuration, CI/CD pipeline, and health checks.',
  },
  {
    id: 'ops-docker',
    name: 'Docker Setup',
    category: 'DevOps',
    description: 'Create Docker configuration',
    content:
      'Create Dockerfile and docker-compose.yml for this project. Optimize for production, use multi-stage builds, and include health checks.',
  },
  {
    id: 'ops-ci',
    name: 'CI/CD Pipeline',
    category: 'DevOps',
    description: 'Setup GitHub Actions or CI',
    content:
      'Setup CI/CD pipeline with: lint checks, type checking, tests, build verification, and deployment stages. Use GitHub Actions or similar.',
  },

  // Database
  {
    id: 'db-schema',
    name: 'Database Schema',
    category: 'Database',
    description: 'Design database schema',
    content:
      'Design database schema for [feature] with: tables/collections, relationships, indexes, and constraints. Include migration scripts and seed data.',
  },
  {
    id: 'db-query',
    name: 'Optimize Query',
    category: 'Database',
    description: 'Optimize slow database queries',
    content:
      'Optimize this query for better performance: [query]. Add appropriate indexes, consider caching strategy, and analyze execution plan.',
  },
  {
    id: 'db-migrate',
    name: 'Migration',
    category: 'Database',
    description: 'Create database migration',
    content:
      'Create a migration to [add column/table/modify schema]. Ensure backward compatibility, include rollback script, and handle data transformation safely.',
  },
];

export const getTemplatesByCategory = (
  category: TemplateCategory
): PromptTemplate[] => {
  return PROMPT_TEMPLATES.filter((t) => t.category === category);
};

export const getTemplateById = (id: string): PromptTemplate | undefined => {
  return PROMPT_TEMPLATES.find((t) => t.id === id);
};
