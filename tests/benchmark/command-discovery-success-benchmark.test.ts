import { describe, expect, it } from "vitest";
import { commands } from "../../src/data/commands";
import { recommendCommands } from "../../src/lib/command-recommender";

interface DiscoveryScenario {
  name: string;
  input: string;
  acceptedTop1: string[];
}

const discoveryScenarios: DiscoveryScenario[] = [
  {
    name: "Engineer feature implementation",
    input: "Triển khai feature đăng nhập OAuth cho app",
    acceptedTop1: ["/ck:cook"],
  },
  {
    name: "TypeScript compile error",
    input: "Fix lỗi TypeScript generic mismatch ở component",
    acceptedTop1: ["/ck:fix:types", "/ck:fix"],
  },
  {
    name: "UI bug on mobile",
    input: "Sửa lỗi CSS layout bị vỡ trên mobile",
    acceptedTop1: ["/ck:fix:ui", "/ck:fix"],
  },
  {
    name: "Planning architecture work",
    input: "Lập kế hoạch kiến trúc cho module thanh toán",
    acceptedTop1: ["/ck:plan"],
  },
  {
    name: "Codebase exploration",
    input: "Scout codebase để tìm chỗ xử lý auth hiện tại",
    acceptedTop1: ["/ck:scout"],
  },
  {
    name: "Need technical explanation",
    input: "Giải thích giúp mình trade-off giữa queue và cron",
    acceptedTop1: ["/ck:ask"],
  },
  {
    name: "Run verification tests",
    input: "Run test regression cho module chat",
    acceptedTop1: ["/ck:test"],
  },
  {
    name: "SEO content writing",
    input: "Viết blog chuẩn SEO về AI agent workflow",
    acceptedTop1: ["/write/blog", "/content/blog", "/content/good"],
  },
  {
    name: "Campaign launch",
    input: "Tạo campaign launch sản phẩm mới",
    acceptedTop1: ["/campaign/create"],
  },
  {
    name: "Social content generation",
    input: "Viết nội dung social cho LinkedIn tuần này",
    acceptedTop1: ["/social"],
  },
];

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

describe("benchmark: command discovery success", () => {
  it("meets baseline target from PDR (>=80% top-1 intent hit)", () => {
    const latenciesMs: number[] = [];
    let top1Hits = 0;
    let top3Hits = 0;

    for (const scenario of discoveryScenarios) {
      const startedAt = performance.now();
      const recommendation = recommendCommands(scenario.input, commands);
      latenciesMs.push(performance.now() - startedAt);

      const top1 = recommendation.primary?.command.name;
      const top3 = [
        recommendation.primary?.command.name,
        ...recommendation.alternatives.map((alt) => alt.command.name),
      ].filter((name): name is string => Boolean(name));

      if (top1 && scenario.acceptedTop1.includes(top1)) {
        top1Hits += 1;
      }

      if (scenario.acceptedTop1.some((accepted) => top3.includes(accepted))) {
        top3Hits += 1;
      }
    }

    const total = discoveryScenarios.length;
    const top1Rate = top1Hits / total;
    const top3Rate = top3Hits / total;
    const p95LatencyMs = percentile(latenciesMs, 0.95);

    expect(top1Rate).toBeGreaterThanOrEqual(0.8);
    expect(top3Rate).toBeGreaterThanOrEqual(0.95);
    expect(p95LatencyMs).toBeLessThan(100);
  });
});
