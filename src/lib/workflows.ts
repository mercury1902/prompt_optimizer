import type { Command } from "./commands";

export interface WorkflowStep {
  step: number;
  command: string;
  description: string;
  flags?: string[];
  required?: boolean;
  gateway?: boolean; // Cổng bắt buộc như /clear
  note?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  kit: "engineer" | "marketing" | "both";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeEstimate: string;
  steps: WorkflowStep[];
  useCases: string[];
  keywords: string[];
}

// Predefined workflows based on scout findings
export const workflows: Workflow[] = [
  // Engineer Workflows
  {
    id: "new-feature",
    name: "New Feature Development",
    description: "Complete workflow for implementing a new feature from planning to shipping",
    kit: "engineer",
    difficulty: "Intermediate",
    timeEstimate: "2-4 hours",
    useCases: ["Add authentication", "Build dashboard", "Implement API"],
    keywords: ["feature", "implement", "add", "build", "tạo", "phát triển"],
    steps: [
      {
        step: 1,
        command: "/ck:plan",
        description: "Tạo implementation plan với research",
        flags: ["--auto"],
        note: "Có thể dùng --fast cho plan nhanh"
      },
      {
        step: 2,
        command: "/clear",
        description: "Xóa context trước khi cook",
        required: true,
        gateway: true,
        note: "BẮT BUỘC - Tiết kiệm token"
      },
      {
        step: 3,
        command: "/ck:cook",
        description: "Implement theo plan đã tạo",
        flags: ["--auto"],
        note: "Luôn dùng /cook sau /plan"
      },
      {
        step: 4,
        command: "/ck:test",
        description: "Chạy tests và kiểm tra",
        note: "Tự động detect test framework"
      },
      {
        step: 5,
        command: "/ck:code-review",
        description: "Review code với reviewer agent",
        flags: ["--pending"],
        note: "Hoặc dùng /ck:ship để auto"
      },
      {
        step: 6,
        command: "/ck:git:cp",
        description: "Commit và push changes",
        note: "Stage + commit + push"
      }
    ]
  },
  {
    id: "bootstrap-project",
    name: "New Project Bootstrap",
    description: "Khởi tạo project mới từ zero với CI/CD",
    kit: "engineer",
    difficulty: "Beginner",
    timeEstimate: "30-60 phút",
    useCases: ["New SaaS", "New web app", "Khởi tạo dự án"],
    keywords: ["bootstrap", "new project", "khởi tạo", "init", "scaffold"],
    steps: [
      {
        step: 1,
        command: "/ck:bootstrap",
        description: "Bootstrap project với tất cả config",
        flags: ["--auto"],
        note: "Tự động setup CI/CD, linting"
      },
      {
        step: 2,
        command: "/ck:docs:init",
        description: "Khởi tạo documentation",
        note: "Tạo docs/ structure"
      },
      {
        step: 3,
        command: "/ck:git:cm",
        description: "Initial commit",
        note: "Commit setup files"
      }
    ]
  },
  {
    id: "bug-fix",
    name: "Bug Fix & Debug",
    description: "Workflow xử lý lỗi từ detect đến fix",
    kit: "engineer",
    difficulty: "Beginner",
    timeEstimate: "15-45 phút",
    useCases: ["Fix TypeScript errors", "Debug UI", "Fix tests"],
    keywords: ["fix", "debug", "sửa lỗi", "bug", "error"],
    steps: [
      {
        step: 1,
        command: "/ck:scout",
        description: "Scout codebase tìm vấn đề",
        note: "Tìm files liên quan"
      },
      {
        step: 2,
        command: "/ck:fix",
        description: "Auto-detect và fix issues",
        flags: ["--auto"],
        note: "Routing thông minh đến fix phù hợp"
      },
      {
        step: 3,
        command: "/ck:test",
        description: "Verify fixes",
        note: "Chạy tests để confirm"
      },
      {
        step: 4,
        command: "/ck:git:cp",
        description: "Commit fixes",
        note: "Nhanh gọn"
      }
    ]
  },
  {
    id: "ship-release",
    name: "Ship to Production",
    description: "Complete shipping pipeline từ PR đến deploy",
    kit: "engineer",
    difficulty: "Advanced",
    timeEstimate: "1-2 hours",
    useCases: ["Release feature", "Deploy to prod", "Launch"],
    keywords: ["ship", "deploy", "release", "launch", "production"],
    steps: [
      {
        step: 1,
        command: "/ck:test",
        description: "Final test run",
        flags: ["ui"],
        note: "Test cả UI nếu có"
      },
      {
        step: 2,
        command: "/ck:code-review",
        description: "Final code review",
        flags: ["codebase"],
        note: "Review toàn bộ codebase"
      },
      {
        step: 3,
        command: "/ck:ship",
        description: "Run shipping pipeline",
        flags: ["official"],
        gateway: true,
        note: "Yêu cầu approval"
      },
      {
        step: 4,
        command: "/ck:deploy",
        description: "Deploy đến production",
        note: "Vercel/Railway/Fly.io"
      }
    ]
  },
  {
    id: "refactor-code",
    name: "Code Refactoring",
    description: "Refactor codebase với safety checks",
    kit: "engineer",
    difficulty: "Advanced",
    timeEstimate: "2-6 hours",
    useCases: ["Refactor legacy", "Improve architecture", "Clean code"],
    keywords: ["refactor", "clean code", "improve", "optimize"],
    steps: [
      {
        step: 1,
        command: "/ck:scout",
        description: "Analyze codebase structure",
        note: "Tìm files cần refactor"
      },
      {
        step: 2,
        command: "/ck:plan",
        description: "Lập kế hoạch refactor",
        flags: ["--hard"],
        note: "Deep planning cho complex changes"
      },
      {
        step: 3,
        command: "/clear",
        description: "Clear context",
        required: true,
        gateway: true
      },
      {
        step: 4,
        command: "/ck:cook",
        description: "Execute refactor plan",
        flags: ["--auto"]
      },
      {
        step: 5,
        command: "/ck:test",
        description: "Verify all tests pass",
        note: "CRITICAL - Không skip"
      },
      {
        step: 6,
        command: "/ck:git:cp",
        description: "Commit refactoring"
      }
    ]
  },
  // Marketing Workflows
  {
    id: "content-creation",
    name: "Content Creation Pipeline",
    description: "Tạo content chất lượng cao từ brainstorm đến publish",
    kit: "marketing",
    difficulty: "Intermediate",
    timeEstimate: "1-2 hours",
    useCases: ["Blog post", "Landing page", "Email sequence"],
    keywords: ["content", "write", "blog", "viết", "content marketing"],
    steps: [
      {
        step: 1,
        command: "/seo/keywords",
        description: "Nghiên cứu keywords",
        note: "Tìm keywords phù hợp"
      },
      {
        step: 2,
        command: "/plan",
        description: "Lập outline content",
        flags: ["--fast"]
      },
      {
        step: 3,
        command: "/content/good",
        description: "Viết content chất lượng cao",
        note: "Full checks và optimization"
      },
      {
        step: 4,
        command: "/content/cro",
        description: "Optimize cho conversion",
        note: "CRO best practices"
      },
      {
        step: 5,
        command: "/write/audit",
        description: "Audit content quality",
        note: "Auto-trigger sau write"
      },
      {
        step: 6,
        command: "/git:cm",
        description: "Save content"
      }
    ]
  },
  {
    id: "campaign-launch",
    name: "Marketing Campaign Launch",
    description: "Orchestrate full marketing campaign từ A-Z",
    kit: "marketing",
    difficulty: "Advanced",
    timeEstimate: "4-8 hours",
    useCases: ["Product launch", "Black Friday", "Q1 campaign"],
    keywords: ["campaign", "launch", "marketing", "chiến dịch", "ra mắt"],
    steps: [
      {
        step: 1,
        command: "/brainstorm",
        description: "Brainstorm campaign ideas",
        note: "Creative ideation"
      },
      {
        step: 2,
        command: "/campaign/create",
        description: "Tạo campaign structure",
        note: "Setup campaign folder"
      },
      {
        step: 3,
        command: "/funnel",
        description: "Design conversion funnel",
        note: "Landing → Email → Sale"
      },
      {
        step: 4,
        command: "/design/good",
        description: "Create campaign visuals",
        note: "Hero images, banners"
      },
      {
        step: 5,
        command: "/email/sequence",
        description: "Tạo email sequence",
        note: "Nurture + sales emails"
      },
      {
        step: 6,
        command: "/social",
        description: "Generate social content",
        flags: ["twitter", "linkedin", "instagram"],
        note: "Multi-platform content"
      },
      {
        step: 7,
        command: "/social/schedule",
        description: "Schedule posts",
        flags: ["week"],
        note: "Tự động publish"
      },
      {
        step: 8,
        command: "/campaign/analyze",
        description: "Track performance",
        note: "Ongoing monitoring"
      }
    ]
  },
  {
    id: "seo-content",
    name: "SEO Content Workflow",
    description: "Tạo SEO-optimized content ranking cao",
    kit: "marketing",
    difficulty: "Intermediate",
    timeEstimate: "2-3 hours",
    useCases: ["SEO blog post", "PSEO pages", "Content marketing"],
    keywords: ["seo", "content", "blog", "ranking", "keywords"],
    steps: [
      {
        step: 1,
        command: "/seo/keywords",
        description: "Keyword research",
        note: "Tìm long-tail keywords"
      },
      {
        step: 2,
        command: "/content/blog",
        description: "Viết SEO blog post",
        note: "Optimized for keywords"
      },
      {
        step: 3,
        command: "/seo/optimize",
        description: "On-page SEO optimization",
        note: "Meta, headers, internal links"
      },
      {
        step: 4,
        command: "/seo/schema",
        description: "Add JSON+LD schema",
        note: "Rich snippets"
      },
      {
        step: 5,
        command: "/content/cro",
        description: "Optimize conversion",
        note: "CTAs, readability"
      }
    ]
  },
  {
    id: "video-production",
    name: "Video Production Pipeline",
    description: "Tạo video chuyên nghiệp từ script đến publish",
    kit: "marketing",
    difficulty: "Advanced",
    timeEstimate: "4-6 hours",
    useCases: ["Product demo", "Tutorial video", "YouTube content"],
    keywords: ["video", "youtube", "script", "demo", "production"],
    steps: [
      {
        step: 1,
        command: "/video/script/create",
        description: "Viết video script",
        note: "Hook → Problem → Solution → CTA"
      },
      {
        step: 2,
        command: "/video/storyboard/create",
        description: "Create storyboard",
        note: "Visual planning"
      },
      {
        step: 3,
        command: "/design/generate",
        description: "Generate thumbnail",
        note: "High CTR thumbnail"
      },
      {
        step: 4,
        command: "/video/create",
        description: "Produce video",
        note: "Edit với script"
      },
      {
        step: 5,
        command: "/social",
        description: "Repurpose for social",
        flags: ["youtube shorts", "tiktok"],
        note: "Multi-platform clips"
      }
    ]
  },
  {
    id: "design-creation",
    name: "Design Creation Workflow",
    description: "Tạo designs chất lượng cao với AI assistance",
    kit: "marketing",
    difficulty: "Intermediate",
    timeEstimate: "1-2 hours",
    useCases: ["Landing page design", "Marketing assets", "UI mockups"],
    keywords: ["design", "ui", "mockup", "figma", "creative"],
    steps: [
      {
        step: 1,
        command: "/design/good",
        description: "Create immersive design",
        note: "Detailed design specs"
      },
      {
        step: 2,
        command: "/design/generate",
        description: "Generate AI images",
        note: "Images for design"
      },
      {
        step: 3,
        command: "/design/screenshot",
        description: "Verify design implementation",
        note: "So sánh với mockup"
      },
      {
        step: 4,
        command: "/content/cro",
        description: "Optimize for conversion",
        note: "Design audit"
      }
    ]
  },
  // Hybrid Workflows
  {
    id: "fullstack-feature",
    name: "Full-Stack Feature (Engineer + Marketing)",
    description: "Implement feature với cả code và marketing materials",
    kit: "both",
    difficulty: "Advanced",
    timeEstimate: "4-8 hours",
    useCases: ["New feature launch", "Product update", "Major release"],
    keywords: ["fullstack", "feature", "launch", "complete"],
    steps: [
      {
        step: 1,
        command: "/ck:plan",
        description: "Plan technical implementation",
        flags: ["--hard"]
      },
      {
        step: 2,
        command: "/plan",
        description: "Plan marketing strategy",
        note: "Song song với tech plan"
      },
      {
        step: 3,
        command: "/clear",
        description: "Clear context",
        required: true,
        gateway: true
      },
      {
        step: 4,
        command: "/ck:cook",
        description: "Implement feature",
        flags: ["--auto"]
      },
      {
        step: 5,
        command: "/design/good",
        description: "Create feature UI/marketing",
        note: "Screenshots, mockups"
      },
      {
        step: 6,
        command: "/content/good",
        description: "Write announcement content",
        note: "Blog post, changelog"
      },
      {
        step: 7,
        command: "/ck:test",
        description: "Test implementation"
      },
      {
        step: 8,
        command: "/social",
        description: "Create social announcement",
        note: "Multi-platform"
      },
      {
        step: 9,
        command: "/ck:ship",
        description: "Ship feature",
        flags: ["official"]
      }
    ]
  },
  {
    id: "quick-fix",
    name: "Quick Fix & Patch",
    description: "Fast workflow cho small fixes",
    kit: "engineer",
    difficulty: "Beginner",
    timeEstimate: "5-15 phút",
    useCases: ["Typo fix", "Small bug", "Quick update"],
    keywords: ["quick", "fast", "small", "typo", "minor"],
    steps: [
      {
        step: 1,
        command: "/ck:fix/fast",
        description: "Quick fix",
        note: "Không cần research"
      },
      {
        step: 2,
        command: "/ck:git:cp",
        description: "Commit và push",
        note: "Done!"
      }
    ]
  }
];

// Get workflows by kit
export function getWorkflowsByKit(kit: "engineer" | "marketing" | "both"): Workflow[] {
  return workflows.filter(w => w.kit === kit || w.kit === "both");
}

// Find matching workflows based on input
export function findMatchingWorkflows(input: string): Workflow[] {
  const inputLower = input.toLowerCase();
  const matches: { workflow: Workflow; score: number }[] = [];

  for (const workflow of workflows) {
    let score = 0;

    // Keyword matching
    for (const keyword of workflow.keywords) {
      if (inputLower.includes(keyword.toLowerCase())) {
        score += 2;
      }
    }

    // Use case matching
    for (const useCase of workflow.useCases) {
      if (inputLower.includes(useCase.toLowerCase())) {
        score += 3;
      }
    }

    // Name matching
    if (inputLower.includes(workflow.id.replace(/-/g, " "))) {
      score += 5;
    }

    if (score > 0) {
      matches.push({ workflow, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.map(m => m.workflow);
}

// Detect if input needs workflow (complex task)
export function needsWorkflow(input: string): boolean {
  const complexIndicators = [
    "và", "then", "sau đó", "tiếp theo", "workflow", "quy trình",
    "sequence", "chuỗi", "multiple", "nhiều bước", "full",
    "complete", "từ đầu đến cuối", "end-to-end", "implement",
    "tạo mới", "launch", "release", "campaign"
  ];

  const inputLower = input.toLowerCase();
  return complexIndicators.some(indicator => inputLower.includes(indicator));
}

// Get primary workflow recommendation
export function getPrimaryWorkflow(input: string): Workflow | null {
  const matches = findMatchingWorkflows(input);
  return matches[0] || null;
}
