// Project Context Auto-Detector for Prompt Optimizer
// Detects tech stack, framework, and project configuration automatically

export interface ProjectContext {
  framework: string | null;
  language: string | null;
  styling: string | null;
  hasTests: boolean;
  hasTypeScript: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm' | null;
  additionalContext: string[];
}

/**
 * Detect project context by reading key files
 * Runs client-side in browser - uses file existence checks
 */
export async function detectProjectContext(): Promise<ProjectContext> {
  const context: ProjectContext = {
    framework: null,
    language: null,
    styling: null,
    hasTests: false,
    hasTypeScript: false,
    packageManager: null,
    additionalContext: [],
  };

  // Check for package.json content if available
  // In browser environment, we rely on hints from the current page/context
  // or user-provided project info

  // Detect from window/location or meta tags
  const framework = detectFrameworkFromDOM();
  if (framework) {
    context.framework = framework;
  }

  // Detect from file extensions in current directory (if available)
  const extensions = detectFileExtensions();
  if (extensions.includes('.ts') || extensions.includes('.tsx')) {
    context.hasTypeScript = true;
    context.language = 'TypeScript';
  } else if (extensions.includes('.js') || extensions.includes('.jsx')) {
    context.language = 'JavaScript';
  }

  // Detect styling from DOM classes
  const styling = detectStylingFromDOM();
  if (styling) {
    context.styling = styling;
  }

  // Detect test setup from common patterns
  context.hasTests = detectTestSetup();

  return context;
}

/**
 * Detect framework from DOM indicators
 */
function detectFrameworkFromDOM(): string | null {
  // Check for Astro
  if (document.querySelector('astro-island') || window.location.pathname.includes('/guide/')) {
    return 'Astro';
  }

  // Check for Next.js
  if (document.querySelector('#__next') || document.querySelector('[data-nextjs-page]')) {
    return 'Next.js';
  }

  // Check for React
  if (document.querySelector('[data-reactroot]') || document.querySelector('#root')) {
    return 'React';
  }

  // Check for Vue
  if (document.querySelector('[data-v-app]')) {
    return 'Vue';
  }

  return null;
}

/**
 * Detect file extensions from import paths or script tags
 */
function detectFileExtensions(): string[] {
  const extensions: string[] = [];

  // Check script tags for hints
  const scripts = document.querySelectorAll('script[type="module"]');
  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    if (src) {
      if (src.includes('.tsx') || src.includes('.ts')) extensions.push('.ts');
      if (src.includes('.jsx') || src.includes('.js')) extensions.push('.js');
    }
  });

  return [...new Set(extensions)];
}

/**
 * Detect styling framework from DOM classes
 */
function detectStylingFromDOM(): string | null {
  const bodyClasses = document.body.className;

  // Check for Tailwind
  if (bodyClasses.includes('tailwind') || document.querySelector('[class*="tw-"]')) {
    return 'Tailwind CSS';
  }

  // Check for Bootstrap
  if (document.querySelector('[class*="container"]') && document.querySelector('[class*="row"]')) {
    return 'Bootstrap';
  }

  // Check for CSS Modules pattern
  if (document.querySelector('[class*="_"]')) {
    return 'CSS Modules';
  }

  return null;
}

/**
 * Detect if project has test setup
 */
function detectTestSetup(): boolean {
  // Check for test files in common locations (this is a heuristic)
  const hasTestFiles = document.querySelectorAll('script[src*="test"], script[src*="spec"]').length > 0;
  const hasTestingLibs = document.querySelectorAll('script[src*="jest"], script[src*="vitest"], script[src*="cypress"]').length > 0;

  return hasTestFiles || hasTestingLibs;
}

/**
 * Format project context for inclusion in prompt
 */
export function formatProjectContext(context: ProjectContext): string {
  const parts: string[] = [];

  if (context.framework) {
    parts.push(`Framework: ${context.framework}`);
  }

  if (context.language) {
    parts.push(`Language: ${context.language}`);
  }

  if (context.styling) {
    parts.push(`Styling: ${context.styling}`);
  }

  if (context.hasTypeScript) {
    parts.push('TypeScript: Enabled');
  }

  if (context.hasTests) {
    parts.push('Testing: Configured');
  }

  if (context.additionalContext.length > 0) {
    parts.push(...context.additionalContext);
  }

  return parts.length > 0
    ? `\n\nProject Context:\n${parts.map((p) => `- ${p}`).join('\n')}`
    : '';
}

/**
 * Create enriched system prompt with project context
 */
export function createEnrichedSystemPrompt(
  baseSystemPrompt: string,
  context: ProjectContext
): string {
  const contextString = formatProjectContext(context);

  return `${baseSystemPrompt}${contextString}`;
}
