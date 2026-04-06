// Full ClaudeKit Commands Catalog - Engineer + Marketing
// Based on scout reports from claudekit-engineer and claudekit-marketing

export interface Command {
  id: string;
  name: string;
  category: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  description: string;
  keywords: string[];
  patterns: string[];
  useCases: string[];
  args?: string;
  variants?: string[];
}

// Engineer Kit Commands (Based on scout report)
export const engineerCommands: Command[] = [
  // Core Development Commands
  {
    id: "ck:cook",
    name: "/ck:cook",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Implement feature [step by step] - ALWAYS USE FIRST",
    keywords: ["implement", "feature", "tạo", "build", "code", "làm", "thêm", "phát triển", "cook"],
    patterns: ["implement.*feature|tạo|build|code.*feature|phát triển|cook"],
    useCases: ["Implement features", "Build functionality", "Code end-to-end"],
    args: "[tasks]",
    variants: ["/ck:cook:auto", "/ck:cook:auto:fast", "/ck:cook:auto:parallel", "/ck:cook --no-test"]
  },
  {
    id: "ck:plan",
    name: "/ck:plan",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Intelligent plan creation with research",
    keywords: ["plan", "kế hoạch", "thiết kế", "architecture", "design", "lập kế hoạch", "research"],
    patterns: ["plan|kế hoạch|thiết kế|architecture|design.*plan|research"],
    useCases: ["Create plans", "Design architecture", "Research implementation"],
    args: "[task]",
    variants: ["/ck:plan --fast", "/ck:plan --hard", "/ck:plan --two", "/ck:plan --parallel", "/ck:plan --validate"]
  },
  {
    id: "ck:bootstrap",
    name: "/ck:bootstrap",
    category: "Engineer",
    complexity: 5,
    description: "⚡⚡⚡⚡⚡ Bootstrap new project from idea to code",
    keywords: ["bootstrap", "new project", "khởi tạo", "init", "start", "scaffold", "create project"],
    patterns: ["bootstrap|new.*project|khởi tạo|init.*project|scaffold|dự án mới"],
    useCases: ["Create new projects", "Initialize apps", "Scaffold codebases"],
    args: "[user-requirements]",
    variants: ["/ck:bootstrap --auto", "/ck:bootstrap --full", "/ck:bootstrap --fast", "/ck:bootstrap --parallel"]
  },
  {
    id: "ck:fix",
    name: "/ck:fix",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Analyze and fix issues [INTELLIGENT ROUTING]",
    keywords: ["fix", "sửa", "lỗi", "bug", "error", "broken", "issue", "problem", "debug"],
    patterns: ["fix|sửa|lỗi|bug|error|broken|issue|problem|crash|fail|debug"],
    useCases: ["Fix bugs", "Debug issues", "Repair code"],
    args: "[issues]",
    variants: ["/ck:fix --auto", "/ck:fix --quick", "/ck:fix --review", "/ck:fix --parallel"]
  },
  {
    id: "ck:fix:types",
    name: "/ck:fix:types",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Fix TypeScript type errors",
    keywords: ["typescript", "type error", "tsc", "type check", "type mismatch", "ts error"],
    patterns: ["typescript|type.*error|tsc|type.*check|type.*mismatch"],
    useCases: ["Fix TypeScript errors", "Resolve type issues", "Type checking"]
  },
  {
    id: "ck:fix:ui",
    name: "/ck:fix:ui",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Fix UI/UX issues",
    keywords: ["ui", "ux", "design", "layout", "style", "visual", "css", "responsive"],
    patterns: ["ui|ux|design|layout|style|visual|css|responsive|frontend"],
    useCases: ["Fix UI bugs", "Repair layouts", "CSS issues"]
  },
  {
    id: "ck:fix:ci",
    name: "/ck:fix:ci",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Fix CI/CD pipeline issues",
    keywords: ["github actions", "pipeline", "ci/cd", "workflow", "deployment", "build failed"],
    patterns: ["github.*actions|pipeline|ci/cd|workflow|deployment|build.*fail"],
    useCases: ["Fix CI/CD", "Repair pipelines", "GitHub Actions"]
  },
  {
    id: "ck:fix:test",
    name: "/ck:fix:test",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Fix failing tests",
    keywords: ["test", "spec", "jest", "vitest", "failing test", "test suite", "kiểm thử"],
    patterns: ["test|spec|jest|vitest|failing.*test|test.*suite|kiểm thử"],
    useCases: ["Fix tests", "Repair test suites", "Test failures"]
  },
  {
    id: "ck:fix:logs",
    name: "/ck:fix:logs",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Fix from log analysis",
    keywords: ["logs", "error logs", "log file", "stack trace", "debug logs"],
    patterns: ["logs|error.*logs|log.*file|stack.*trace|debug.*logs"],
    useCases: ["Analyze logs", "Fix from logs", "Log debugging"]
  },
  {
    id: "ck:fix:fast",
    name: "/ck:fix:fast",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Quick fix for simple issues",
    keywords: ["quick fix", "simple", "small bug", "straightforward", "easy fix", "fast"],
    patterns: ["quick.*fix|simple.*bug|small.*bug|straightforward|easy.*fix|fast"],
    useCases: ["Quick fixes", "Simple repairs", "Fast debugging"]
  },
  {
    id: "ck:fix:hard",
    name: "/ck:fix:hard",
    category: "Engineer",
    complexity: 4,
    description: "⚡⚡⚡⚡ Fix complex architectural issues",
    keywords: ["complex", "architecture", "refactor", "major", "system-wide", "deep issue"],
    patterns: ["complex|architecture|refactor|major|system-wide|deep.*issue"],
    useCases: ["Complex fixes", "Architectural repairs", "System-wide issues"]
  },
  {
    id: "ck:test",
    name: "/ck:test",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Testing & QA - run tests",
    keywords: ["test", "kiểm thử", "run test", "chạy test", "qa", "quality"],
    patterns: ["run.*test|kiểm thử|test|chạy.*test|qa|quality"],
    useCases: ["Run tests", "Execute tests", "Test suite"]
  },
  {
    id: "ck:code-review",
    name: "/ck:code-review",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Adversarial code review",
    keywords: ["review", "code review", "audit", "check code", "review code"],
    patterns: ["review|code.*review|audit|check.*code"],
    useCases: ["Review code", "Audit code", "Quality check"],
    variants: ["/ck:code-review #PR", "/ck:code-review COMMIT", "/ck:code-review --pending", "/ck:code-review codebase"]
  },
  {
    id: "ck:ship",
    name: "/ck:ship",
    category: "Engineer",
    complexity: 4,
    description: "⚡⚡⚡⚡ Shipping pipeline to PR",
    keywords: ["ship", "release", "deploy", "publish", "launch", "production"],
    patterns: ["ship|release|deploy|publish|launch|production|merge"],
    useCases: ["Ship code", "Create PR", "Release feature"],
    variants: ["/ck:ship official", "/ck:ship beta", "/ck:ship --skip-tests", "/ck:ship --dry-run"]
  },
  {
    id: "ck:deploy",
    name: "/ck:deploy",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Deploy to 15+ platforms",
    keywords: ["deploy", "hosting", "vercel", "railway", "fly", "production"],
    patterns: ["deploy|hosting|vercel|railway|fly|production"],
    useCases: ["Deploy app", "Production release", "Go live"]
  },
  {
    id: "ck:debug",
    name: "/ck:debug",
    category: "Engineer",
    complexity: 4,
    description: "⚡⚡⚡⚡ Debug complex issues with deep analysis",
    keywords: ["debug", "deep debug", "complex debug", "analyze bug", "trace", "diagnose"],
    patterns: ["debug|deep.*debug|complex.*debug|analyze.*bug|trace.*issue|diagnose"],
    useCases: ["Debug complex issues", "Deep analysis", "Trace problems"],
    variants: ["/ck:debug --trace", "/ck:debug --analyze", "/ck:debug --step"]
  },
  {
    id: "ck:fix:parallel",
    name: "/ck:fix:parallel",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Fix issues using parallel agents",
    keywords: ["fix parallel", "parallel fix", "multi fix", "concurrent fix"],
    patterns: ["fix.*parallel|parallel.*fix|multi.*fix|concurrent.*fix"],
    useCases: ["Parallel fixing", "Multi-agent fix", "Concurrent repairs"]
  },
  {
    id: "ck:scout",
    name: "/ck:scout",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Fast codebase scouting with parallel agents",
    keywords: ["scout", "explore", "find", "tìm", "search", "locate", "discover"],
    patterns: ["scout|explore|find|tìm|search.*code|locate|discover"],
    useCases: ["Explore code", "Find files", "Scout codebase"]
  },
  {
    id: "ck:research",
    name: "/ck:research",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Technical research and architecture analysis",
    keywords: ["research", "investigate", "study", "learn", "architecture", "compare"],
    patterns: ["research|investigate|study|learn|architecture|compare.*tech"],
    useCases: ["Research tech", "Architecture analysis", "Technology comparison"]
  },
  {
    id: "ck:ask",
    name: "/ck:ask",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Technical consultation with 4 advisors",
    keywords: ["ask", "hỏi", "question", "explain", "giải thích", "how to", "what is"],
    patterns: ["ask|hỏi|question|explain|giải thích|how.*to|what.*is"],
    useCases: ["Ask questions", "Get explanations", "Technical Q&A"]
  },
  {
    id: "ck:team",
    name: "/ck:team",
    category: "Engineer",
    complexity: 4,
    description: "⚡⚡⚡⚡ Multi-agent orchestration",
    keywords: ["team", "multi-agent", "parallel", "orchestrate", "coordinate"],
    patterns: ["team|multi.*agent|parallel.*dev|orchestrate|coordinate"],
    useCases: ["Multi-agent work", "Parallel development", "Team coordination"]
  },
  {
    id: "ck:worktree",
    name: "/ck:worktree",
    category: "Engineer",
    complexity: 3,
    description: "⚡⚡⚡ Git worktree isolation for parallel dev",
    keywords: ["worktree", "parallel", "branch", "isolation", "git worktree"],
    patterns: ["worktree|parallel.*dev|git.*worktree|isolation"],
    useCases: ["Parallel development", "Worktree management", "Git isolation"]
  },
  {
    id: "clear",
    name: "/clear",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Clear context and wipe conversation state",
    keywords: ["clear", "wipe", "reset", "clean", "new context", "fresh start"],
    patterns: ["clear|wipe.*context|reset.*conversation|clean.*state|fresh.*start"],
    useCases: ["Clear conversation", "Wipe context", "Fresh start", "Reset state"]
  },
  {
    id: "ck:docs:init",
    name: "/ck:docs:init",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Initialize project documentation",
    keywords: ["docs init", "init docs", "documentation init", "setup docs"],
    patterns: ["docs.*init|init.*docs|documentation.*init|setup.*documentation"],
    useCases: ["Initialize documentation", "Setup docs structure", "Create docs foundation"]
  },
  {
    id: "ck:docs",
    name: "/ck:docs",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Documentation operations",
    keywords: ["doc", "documentation", "readme", "wiki", "guide", "api docs"],
    patterns: ["doc|documentation|readme|wiki|guide|api.*doc"],
    useCases: ["Write docs", "Update documentation", "API docs"],
    variants: ["/ck:docs init", "/ck:docs update", "/ck:docs summarize", "/ck:docs llms"]
  },
  {
    id: "plan",
    name: "/plan",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Quick plan creation (shorthand)",
    keywords: ["plan", "quick plan", "simple plan", "fast plan"],
    patterns: ["^/plan$|quick.*plan|simple.*plan|fast.*plan"],
    useCases: ["Quick planning", "Simple plan creation", "Fast plan"]
  },
  {
    id: "ck:git:cm",
    name: "/ck:git:cm",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Stage and commit all changes",
    keywords: ["commit", "git commit", "save", "stage", "cm"],
    patterns: ["commit|git.*commit|save.*changes|stage|cm"],
    useCases: ["Commit changes", "Save work", "Git commit"]
  },
  {
    id: "git:cm",
    name: "/git:cm",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Stage and commit (shorthand)",
    keywords: ["git cm", "commit shorthand", "quick commit", "git commit short"],
    patterns: ["^/git:cm$|git.*cm|quick.*commit"],
    useCases: ["Quick commit", "Shorthand commit", "Fast git commit"]
  },
  {
    id: "ck:git:cp",
    name: "/ck:git:cp",
    category: "Engineer",
    complexity: 1,
    description: "⚡ Stage, commit and push",
    keywords: ["push", "git push", "commit push", "cp", "save push"],
    patterns: ["push|git.*push|commit.*push|cp"],
    useCases: ["Push code", "Commit and push", "Share changes"]
  },
  {
    id: "ck:git:pr",
    name: "/ck:git:pr",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Create pull request",
    keywords: ["pr", "pull request", "merge request", "review"],
    patterns: ["pr|pull.*request|merge.*request|create.*pr"],
    useCases: ["Create PR", "Pull request", "Code review"]
  },
  {
    id: "ck:preview",
    name: "/ck:preview",
    category: "Engineer",
    complexity: 2,
    description: "⚡⚡ Visual preview/slides/diagrams",
    keywords: ["preview", "diagram", "slide", "visual", "chart", "mermaid"],
    patterns: ["preview|diagram|slide|visual|chart|mermaid"],
    useCases: ["Create diagrams", "Generate slides", "Visual preview"]
  }
];

// Marketing Kit Commands (Based on scout report)
export const marketingCommands: Command[] = [
  // Content Creation
  {
    id: "content:good",
    name: "/content/good",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ High-quality content with full checks",
    keywords: ["content", "write", "good", "quality", "blog", "article"],
    patterns: ["content.*good|write.*good|quality.*content|blog.*post"],
    useCases: ["High-quality content", "Professional writing", "Content marketing"]
  },
  {
    id: "content:fast",
    name: "/content/fast",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Quick content without extensive checks",
    keywords: ["content", "fast", "quick", "speed", "rapid"],
    patterns: ["content.*fast|quick.*content|rapid.*write|speed"],
    useCases: ["Quick content", "Fast writing", "Speed content"]
  },
  {
    id: "content:cro",
    name: "/content/cro",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Optimize content for conversions",
    keywords: ["cro", "conversion", "optimize", "landing page", "hero section"],
    patterns: ["content.*cro|conversion.*optimize|landing.*page|hero.*section"],
    useCases: ["Conversion optimization", "CRO content", "Sales copy"]
  },
  {
    id: "content:blog",
    name: "/content/blog",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Create blog content with SEO optimization",
    keywords: ["content blog", "blog content", "content creation blog", "write blog"],
    patterns: ["content.*blog|blog.*content|write.*blog.*content"],
    useCases: ["Create blog content", "Blog content creation", "SEO blog writing"]
  },
  {
    id: "write:blog",
    name: "/write/blog",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ SEO-optimized blog content",
    keywords: ["blog", "write", "article", "seo", "content marketing"],
    patterns: ["write.*blog|blog.*post|article.*write|seo.*content"],
    useCases: ["Write blog posts", "SEO articles", "Content marketing"]
  },
  {
    id: "write:good",
    name: "/write/good",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Write creative copy (GOOD mode)",
    keywords: ["write", "copy", "creative", "good", "copywriting"],
    patterns: ["write.*good|creative.*write|copywriting|good.*mode"],
    useCases: ["Creative copy", "Marketing copy", "Good mode writing"]
  },
  {
    id: "write:fast",
    name: "/write/fast",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Write copy quickly (FAST mode)",
    keywords: ["write", "fast", "quick", "speed", "rapid"],
    patterns: ["write.*fast|quick.*write|speed.*write|fast.*mode"],
    useCases: ["Fast writing", "Quick copy", "Rapid content"]
  },
  {
    id: "write:publish",
    name: "/write/publish",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Auto-fix content to publish-ready",
    keywords: ["publish", "finalize", "ready", "auto-fix", "polish"],
    patterns: ["write.*publish|publish.*ready|auto.*fix|finalize"],
    useCases: ["Publish ready", "Finalize content", "Auto polish"]
  },
  {
    id: "write:audit",
    name: "/write/audit",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Audit content quality",
    keywords: ["audit", "review", "quality check", "assess"],
    patterns: ["write.*audit|audit.*content|quality.*check|assess"],
    useCases: ["Content audit", "Quality review", "Content check"]
  },
  // SEO Commands
  {
    id: "seo:keywords",
    name: "/seo/keywords",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Keyword research",
    keywords: ["seo", "keywords", "research", "search", "ranking"],
    patterns: ["seo.*keywords|keyword.*research|search.*terms|ranking"],
    useCases: ["Keyword research", "SEO analysis", "Search terms"]
  },
  {
    id: "seo:optimize",
    name: "/seo/optimize",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ On-page SEO optimization",
    keywords: ["seo", "optimize", "on-page", "meta", "headers"],
    patterns: ["seo.*optimize|on.*page|meta.*tag|header.*optimize"],
    useCases: ["On-page SEO", "Optimize content", "SEO improvements"]
  },
  {
    id: "seo:schema",
    name: "/seo/schema",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Generate JSON+LD schema",
    keywords: ["schema", "json+ld", "structured data", "rich snippets"],
    patterns: ["seo.*schema|json.*ld|structured.*data|rich.*snippet"],
    useCases: ["Generate schema", "Structured data", "Rich snippets"]
  },
  {
    id: "seo:audit",
    name: "/seo/audit",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Technical SEO audit",
    keywords: ["seo", "audit", "technical", "analyze", "check"],
    patterns: ["seo.*audit|technical.*seo|analyze.*seo|seo.*check"],
    useCases: ["SEO audit", "Technical SEO", "Site analysis"]
  },
  // Design Commands
  {
    id: "design:good",
    name: "/design/good",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Create immersive designs",
    keywords: ["design", "ui", "good", "creative", "immersive"],
    patterns: ["design.*good|ui.*design|creative.*design|immersive"],
    useCases: ["UI design", "Good design", "Creative UI"]
  },
  {
    id: "design:fast",
    name: "/design/fast",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Quick design creation",
    keywords: ["design", "fast", "quick", "rapid", "speed"],
    patterns: ["design.*fast|quick.*design|rapid.*design|speed"],
    useCases: ["Quick design", "Fast UI", "Rapid prototype"]
  },
  {
    id: "design:generate",
    name: "/design/generate",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Generate AI images",
    keywords: ["generate", "ai image", "image", "art", "create image"],
    patterns: ["design.*generate|generate.*image|ai.*image|create.*image"],
    useCases: ["Generate images", "AI art", "Image creation"]
  },
  {
    id: "design:screenshot",
    name: "/design/screenshot",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Design from screenshot",
    keywords: ["screenshot", "image", "design from", "reference"],
    patterns: ["design.*screenshot|screenshot.*design|from.*image|reference"],
    useCases: ["Screenshot design", "From image", "Reference design"]
  },
  {
    id: "design:3d",
    name: "/design/3d",
    category: "Marketing",
    complexity: 4,
    description: "⚡⚡⚡⚡ Interactive 3D with Three.js",
    keywords: ["3d", "three.js", "interactive", "model", "3d design"],
    patterns: ["design.*3d|three.*js|interactive.*3d|3d.*model"],
    useCases: ["3D design", "Three.js", "Interactive 3D"]
  },
  // Social Media
  {
    id: "social",
    name: "/social",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Generate social content",
    keywords: ["social", "twitter", "linkedin", "instagram", "post"],
    patterns: ["social.*post|twitter.*post|linkedin.*post|instagram.*post"],
    useCases: ["Social content", "Platform posts", "Social media"]
  },
  {
    id: "social:schedule",
    name: "/social/schedule",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Schedule posts",
    keywords: ["schedule", "calendar", "plan", "auto post"],
    patterns: ["social.*schedule|schedule.*post|calendar|auto.*post"],
    useCases: ["Schedule posts", "Content calendar", "Auto publish"]
  },
  // Campaign
  {
    id: "campaign:create",
    name: "/campaign/create",
    category: "Marketing",
    complexity: 4,
    description: "⚡⚡⚡⚡ Create new campaign",
    keywords: ["campaign", "create", "launch", "marketing campaign"],
    patterns: ["campaign.*create|create.*campaign|launch.*campaign|marketing.*campaign"],
    useCases: ["Create campaign", "Launch campaign", "Marketing initiative"]
  },
  {
    id: "campaign:analyze",
    name: "/campaign/analyze",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Analyze campaign performance",
    keywords: ["campaign", "analyze", "performance", "metrics", "report"],
    patterns: ["campaign.*analyze|analyze.*campaign|performance|metrics"],
    useCases: ["Analyze campaign", "Performance review", "Campaign metrics"]
  },
  // Email
  {
    id: "email:sequence",
    name: "/email/sequence",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Drip sequence design",
    keywords: ["email", "sequence", "drip", "automation", "flow"],
    patterns: ["email.*sequence|sequence.*email|drip.*campaign|automation"],
    useCases: ["Email sequence", "Drip campaign", "Email automation"]
  },
  {
    id: "email:flow",
    name: "/email/flow",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Email flow automation",
    keywords: ["email", "flow", "automation", "workflow", "trigger"],
    patterns: ["email.*flow|flow.*email|email.*automation|trigger"],
    useCases: ["Email flow", "Automation", "Email workflow"]
  },
  // Video
  {
    id: "video:script:create",
    name: "/video/script/create",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Create video scripts",
    keywords: ["video", "script", "write", "story", "content"],
    patterns: ["video.*script|script.*create|write.*script|video.*content"],
    useCases: ["Video script", "Script writing", "Video content"]
  },
  {
    id: "video:storyboard:create",
    name: "/video/storyboard/create",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Create storyboards",
    keywords: ["storyboard", "video", "scene", "visual", "plan"],
    patterns: ["storyboard.*create|video.*storyboard|scene.*plan|visual.*plan"],
    useCases: ["Storyboard", "Scene planning", "Visual planning"]
  },
  {
    id: "video:create",
    name: "/video/create",
    category: "Marketing",
    complexity: 4,
    description: "⚡⚡⚡⚡ Create videos",
    keywords: ["video", "create", "produce", "edit", "film"],
    patterns: ["video.*create|create.*video|produce.*video|edit.*video"],
    useCases: ["Create video", "Video production", "Film editing"]
  },
  // Analytics & Strategy
  {
    id: "funnel",
    name: "/funnel",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Funnel design and optimization",
    keywords: ["funnel", "conversion", "lead", "sales funnel", "optimize"],
    patterns: ["funnel.*design|conversion.*funnel|sales.*funnel|lead.*funnel"],
    useCases: ["Funnel design", "Conversion funnel", "Sales optimization"]
  },
  {
    id: "competitor",
    name: "/competitor",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Competitor analysis",
    keywords: ["competitor", "analysis", "benchmark", "research", "market"],
    patterns: ["competitor.*analysis|benchmark|market.*research|competitor"],
    useCases: ["Competitor analysis", "Market research", "Benchmarking"]
  },
  {
    id: "persona",
    name: "/persona",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Customer persona management",
    keywords: ["persona", "customer", "avatar", "target", "audience"],
    patterns: ["persona.*create|customer.*persona|target.*audience|avatar"],
    useCases: ["Create persona", "Customer avatar", "Target audience"]
  },
  // Skills
  {
    id: "skill:create",
    name: "/skill/create",
    category: "Marketing",
    complexity: 3,
    description: "⚡⚡⚡ Create new skill",
    keywords: ["skill", "create", "new skill", "custom skill"],
    patterns: ["skill.*create|create.*skill|new.*skill|custom.*skill"],
    useCases: ["Create skill", "New skill", "Custom capability"]
  },
  // Brainstorm (Marketing Ideas)
  {
    id: "brainstorm",
    name: "/brainstorm",
    category: "Marketing",
    complexity: 2,
    description: "⚡⚡ Marketing ideas and creativity",
    keywords: ["brainstorm", "ideas", "creative", "think", "concept"],
    patterns: ["brainstorm|marketing.*ideas|creative.*ideas|think|concept"],
    useCases: ["Brainstorm ideas", "Marketing concepts", "Creative thinking"]
  }
];

// Combine all commands
export const commands: Command[] = [...engineerCommands, ...marketingCommands];

export const categories = [...new Set(commands.map(c => c.category))];

export function getCommandById(id: string): Command | undefined {
  return commands.find(c => c.id === id);
}

export function getCommandsByCategory(category: string): Command[] {
  return commands.filter(c => c.category === category);
}

export function getAllCommandNames(): string[] {
  return commands.map(c => c.name);
}
