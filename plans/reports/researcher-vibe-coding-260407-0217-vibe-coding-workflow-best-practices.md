# Vibe Coding Workflow Research Report

**Researcher:** researcher-vibe-coding  
**Date:** 2026-04-07  
**Project:** claudekit-chatbot-astro

---

## Executive Summary

**Vibe coding** is an AI-assisted development workflow where developers describe intent in natural language and Claude Code handles implementation details. It shifts focus from manual coding to collaborative problem-solving with AI.

### Key Principles

1. **Describe, don't prescribe** - State what you want, not how to build it
2. **Iterate conversationally** - Treat AI as pair programmer, not code generator
3. **Trust the process** - Use /plan first, then /cook for implementation
4. **Stay in flow** - Use slash commands to maintain momentum

---

## What is Vibe Coding

Vibe coding is the practice of:
- Describing features in natural language
- Letting AI handle implementation details
- Reviewing and refining iteratively
- Maintaining creative flow without syntax interruptions

### Contrast with Traditional Coding

| Traditional | Vibe Coding |
|-------------|-------------|
| Write every line manually | Describe intent, AI implements |
| Context-switch to documentation | AI brings relevant patterns |
| Manual debugging cycles | /debug for guided diagnostics |
| Boilerplate-heavy | AI handles repetitive code |

---

## Claude Code Command Patterns

### Core Development Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/plan [task]` | Research and create implementation plan | Complex features requiring architecture decisions |
| `/cook [task]` | Implement features step by step | Ready to build after planning |
| `/debug [issue]` | Diagnose and fix problems | Something is broken |
| `/fix:fast [issue]` | Quick fixes | Simple, straightforward bugs |
| `/fix:hard [issue]` | Complex fixes requiring subagents | Deep architectural issues |
| `/test` | Run test suite | Validate implementation |

### Git Workflow Commands

| Command | Purpose |
|---------|---------|
| `/git:cm` | Stage all and commit with auto message |
| `/git:cp` | Stage, commit, and push |
| `/git:pr [branch] [base]` | Create pull request |

### Documentation Commands

| Command | Purpose |
|---------|---------|
| `/docs:init` | Create initial docs structure |
| `/docs:update` | Update docs based on code changes |
| `/docs:summarize` | Generate codebase overview |

### Planning Commands

| Command | Purpose |
|---------|---------|
| `/plan:two [task]` | Create plan with 2 alternative approaches |
| `/brainstorm [question]` | Ideation and exploration |
| `/watzup` | End-of-session summary |

---

## Prompt Engineering Best Practices

### 1. Be Specific About Intent

**Less effective:**
```
Fix the login button
```

**More effective:**
```
/fix:fast the login button shows loading state but doesn't redirect after successful auth
```

### 2. Provide Context

**Less effective:**
```
/cook add authentication
```

**More effective:**
```
/cook implement JWT-based authentication with access/refresh tokens using our existing User model in src/models/
```

### 3. Use Variables in Custom Commands

Create reusable commands in `.claude/commands/`:

```markdown
# .claude/commands/create-component.md

Create a React component for {{feature}} with:
- TypeScript props interface
- Tailwind CSS styling
- Unit tests in __tests__ folder
- Export from src/components/index.ts
```

Usage: `/create-component user-profile`

### 4. Chain Commands for Complex Workflows

```bash
# Plan first
/plan implement real-time chat with WebSockets

# Review plan, then implement
/cook implement real-time chat with WebSockets

# Test
/test

# Commit
/git:cm
```

---

## Project Structure for AI Collaboration

### Recommended `.claude/` Directory

```
project/
├── .claude/
│   ├── settings.json          # Project settings
│   ├── commands/              # Custom slash commands
│   │   ├── test-all.md
│   │   └── deploy.md
│   ├── skills/               # Project-specific skills
│   │   └── api-testing/
│   ├── hooks.json            # Event hooks
│   ├── mcp.json              # MCP servers (no secrets)
│   └── .env.example          # Environment template
├── docs/                     # Project documentation
│   ├── development-roadmap.md
│   ├── system-architecture.md
│   └── code-standards.md
├── src/
├── tests/
└── README.md
```

### Version Control Guidelines

**Commit to git:**
- `.claude/settings.json`
- `.claude/commands/`
- `.claude/skills/`
- `.claude/mcp.json` (without secrets)
- `.claude/.env.example`

**Gitignore:**
```
.claude/.env
.claude/memory/
.claude/cache/
.claude/logs/
```

---

## MCP (Model Context Protocol) Integration Patterns

### What is MCP

MCP enables Claude Code to connect to external tools and services:
- Databases (PostgreSQL, MySQL)
- APIs (GitHub, Jira, Slack)
- Services (Brave Search, Puppeteer)
- Custom tools

### Configuration in `.claude/mcp.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

### Common MCP Servers for Chatbot Projects

| Server | Use Case |
|--------|----------|
| `@modelcontextprotocol/server-postgres` | Database queries |
| `@modelcontextprotocol/server-github` | PR management, code search |
| `@modelcontextprotocol/server-brave-search` | Web search for documentation |
| `@modelcontextprotocol/server-puppeteer` | Browser automation, screenshots |

---

## Git Integration Best Practices

### Feature Development Workflow

```bash
# 1. Plan the feature
/plan implement user authentication

# 2. Create checkpoint (optional)
claude checkpoint create "before-auth-implementation"

# 3. Implement
/cook implement user authentication

# 4. Run tests
/test

# 5. Review changes
claude "review authentication implementation"

# 6. Commit and push
/git:cm
/git:cp
```

### Bug Fix Workflow

```bash
# 1. Debug the issue
/debug API returns 500 errors intermittently

# 2. Apply fix
/fix:fast the login timeout issue

# 3. Verify with tests
/test

# 4. Commit
/git:cm
```

### CI/CD Integration

```bash
# Analyze failed build
/fix:ci https://github.com/owner/repo/actions/runs/123456

# Plan fix based on CI logs
/plan:ci https://github.com/owner/repo/actions/runs/123456
```

---

## Workflow Recommendations for Chatbot Project

### Project Setup

1. Initialize with `/init` for interactive setup
2. Create custom commands for common tasks:
   - `/test-chatbot` - Run chatbot-specific tests
   - `/deploy-vercel` - Deploy to Vercel
   - `/check-types` - TypeScript check

### Development Patterns

**Adding a new feature:**
```bash
/plan add conversation history persistence
# Review plan
/cook add conversation history persistence
/test
/docs:update
/git:cm
```

**Refactoring:**
```bash
/refactor the message handling system
/test
/git:cm
```

**UI Updates:**
```bash
/design:fast improve chat input styling
/fix:ui mobile responsiveness issues
/test
/git:cm
```

---

## Team Collaboration with Claude Code

### Shared Configuration

Create `.claude/settings.json` for team consistency:

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "maxTokens": 8192,
  "outputStyle": "technical-writer",
  "thinking": {
    "enabled": true,
    "budget": 10000
  },
  "memory": {
    "enabled": true,
    "location": "project"
  }
}
```

### Skill Sharing

Package team skills as plugins:

```bash
# Create team plugin
cd .claude/plugins/team-plugin
cat > plugin.json <<EOF
{
  "name": "chatbot-dev-tools",
  "skills": ["skills/*/"],
  "commands": ["commands/*.md"]
}
EOF

# Share with team
tar -czf chatbot-dev-tools.tar.gz .
```

---

## Cost Optimization Tips

### Model Selection

- **Haiku**: Fast, cost-effective for simple tasks
  ```bash
  claude --model haiku "fix typo in README"
  ```

- **Sonnet** (default): Balanced for most development
  ```bash
  claude "implement user authentication"
  ```

- **Opus**: Complex architectural tasks
  ```bash
  claude --model opus "design microservices architecture"
  ```

### Enable Caching

```json
{
  "caching": {
    "enabled": true,
    "ttl": 300
  }
}
```

### Batch Operations

```bash
# Instead of multiple requests
claude "fix file1.js file2.js file3.js"
```

---

## Summary: Key Takeaways

1. **Start with /plan** for complex features, then /cook for implementation
2. **Describe intent clearly** - what you want, not how to build it
3. **Use custom commands** for repetitive team workflows
4. **Configure MCP servers** for external tool integration
5. **Version control .claude/** directory (except .env)
6. **Choose appropriate models** for cost optimization
7. **Chain commands** for complete workflows

---

## Unresolved Questions

1. What is the optimal checkpoint strategy for long-running vibe coding sessions?
2. How to best handle merge conflicts when multiple team members use vibe coding on same files?
3. What are the limits of /cook command complexity before requiring explicit /plan?
4. How to maintain code ownership attribution in AI-assisted commits?
5. Best practices for vibe coding with legacy codebases lacking tests?
