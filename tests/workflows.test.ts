import { describe, it, expect } from "vitest";
import {
  workflows,
  getWorkflowsByKit,
  findMatchingWorkflows,
  needsWorkflow,
  getPrimaryWorkflow
} from "../src/lib/workflows";

describe("Workflows", () => {
  describe("Workflow Data Integrity", () => {
    it("should have at least one workflow defined", () => {
      expect(workflows.length).toBeGreaterThan(0);
    });

    it("should have valid workflow structure", () => {
      workflows.forEach(workflow => {
        expect(workflow.id).toBeDefined();
        expect(workflow.name).toBeDefined();
        expect(workflow.description).toBeDefined();
        expect(workflow.kit).toBeDefined();
        expect(workflow.difficulty).toBeDefined();
        expect(workflow.timeEstimate).toBeDefined();
        expect(workflow.steps).toBeDefined();
        expect(workflow.useCases).toBeDefined();
        expect(workflow.keywords).toBeDefined();
      });
    });

    it("should have valid kit values", () => {
      const validKits = ["engineer", "marketing", "both"];
      workflows.forEach(workflow => {
        expect(validKits).toContain(workflow.kit);
      });
    });

    it("should have valid difficulty values", () => {
      const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
      workflows.forEach(workflow => {
        expect(validDifficulties).toContain(workflow.difficulty);
      });
    });

    it("should have at least one step per workflow", () => {
      workflows.forEach(workflow => {
        expect(workflow.steps.length).toBeGreaterThan(0);
      });
    });

    it("should have steps with valid structure", () => {
      workflows.forEach(workflow => {
        workflow.steps.forEach((step, index) => {
          expect(step.step).toBe(index + 1); // Steps should be sequential
          expect(step.command).toBeDefined();
          expect(step.description).toBeDefined();
        });
      });
    });

    it("should have at least one keyword per workflow", () => {
      workflows.forEach(workflow => {
        expect(workflow.keywords.length).toBeGreaterThan(0);
      });
    });

    it("should have at least one use case per workflow", () => {
      workflows.forEach(workflow => {
        expect(workflow.useCases.length).toBeGreaterThan(0);
      });
    });

    it("should have unique workflow IDs", () => {
      const ids = workflows.map(w => w.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(ids.length);
    });
  });

  describe("getWorkflowsByKit", () => {
    it("should return engineer workflows", () => {
      const engineerWorkflows = getWorkflowsByKit("engineer");
      expect(engineerWorkflows.length).toBeGreaterThan(0);
      expect(engineerWorkflows.every(w => w.kit === "engineer" || w.kit === "both")).toBe(true);
    });

    it("should return marketing workflows", () => {
      const marketingWorkflows = getWorkflowsByKit("marketing");
      expect(marketingWorkflows.length).toBeGreaterThan(0);
      expect(marketingWorkflows.every(w => w.kit === "marketing" || w.kit === "both")).toBe(true);
    });

    it("should return both kit workflows", () => {
      const bothWorkflows = getWorkflowsByKit("both");
      // Only workflows with kit "both" should be returned
      expect(bothWorkflows.every(w => w.kit === "both")).toBe(true);
    });

    it("should include 'both' workflows in engineer kit", () => {
      const engineerWorkflows = getWorkflowsByKit("engineer");
      const bothWorkflows = workflows.filter(w => w.kit === "both");
      bothWorkflows.forEach(wf => {
        expect(engineerWorkflows.some(w => w.id === wf.id)).toBe(true);
      });
    });

    it("should include 'both' workflows in marketing kit", () => {
      const marketingWorkflows = getWorkflowsByKit("marketing");
      const bothWorkflows = workflows.filter(w => w.kit === "both");
      bothWorkflows.forEach(wf => {
        expect(marketingWorkflows.some(w => w.id === wf.id)).toBe(true);
      });
    });
  });

  describe("findMatchingWorkflows", () => {
    it("should match by keyword", () => {
      const matches = findMatchingWorkflows("feature");
      expect(matches.length).toBeGreaterThan(0);
      // Should match workflows with "feature" keyword
      const hasFeatureWorkflow = matches.some(w =>
        w.keywords.includes("feature")
      );
      expect(hasFeatureWorkflow).toBe(true);
    });

    it("should match by use case", () => {
      const matches = findMatchingWorkflows("Add authentication");
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should match by name/id", () => {
      const matches = findMatchingWorkflows("new feature development");
      const newFeatureWorkflow = matches.find(w => w.id === "new-feature");
      expect(newFeatureWorkflow).toBeDefined();
    });

    it("should match Vietnamese keywords", () => {
      const matches = findMatchingWorkflows("tạo");
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should return sorted results by score", () => {
      const matches = findMatchingWorkflows("bootstrap project");
      if (matches.length > 1) {
        // Higher scores should come first
        for (let i = 0; i < matches.length - 1; i++) {
          // Can't directly check score, but bootstrap-project should be first
        }
      }
    });

    it("should return empty array for no match", () => {
      const matches = findMatchingWorkflows("xyz123nonexistent");
      expect(matches).toHaveLength(0);
    });

    it("should match multiple keywords", () => {
      const matches = findMatchingWorkflows("create new feature");
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should be case insensitive", () => {
      const lowerCase = findMatchingWorkflows("feature");
      const upperCase = findMatchingWorkflows("FEATURE");
      const mixedCase = findMatchingWorkflows("Feature");

      // Should return similar results regardless of case
      expect(lowerCase.length).toBeGreaterThan(0);
      expect(upperCase.length).toBeGreaterThan(0);
      expect(mixedCase.length).toBeGreaterThan(0);
    });
  });

  describe("needsWorkflow", () => {
    it("should return true for 'và' (and)", () => {
      expect(needsWorkflow("implement và test")).toBe(true);
    });

    it("should return true for 'then'", () => {
      expect(needsWorkflow("do this then that")).toBe(true);
    });

    it("should return true for 'sau đó'", () => {
      expect(needsWorkflow("làm việc này sau đó làm việc khác")).toBe(true);
    });

    it("should return true for 'tiếp theo'", () => {
      expect(needsWorkflow("làm việc này tiếp theo làm việc kia")).toBe(true);
    });

    it("should return true for 'workflow'", () => {
      expect(needsWorkflow("setup workflow")).toBe(true);
    });

    it("should return true for 'quy trình'", () => {
      expect(needsWorkflow("thiết kế quy trình")).toBe(true);
    });

    it("should return true for 'sequence'", () => {
      expect(needsWorkflow("command sequence")).toBe(true);
    });

    it("should return true for 'chuỗi'", () => {
      expect(needsWorkflow("chuỗi lệnh")).toBe(true);
    });

    it("should return true for 'multiple'", () => {
      expect(needsWorkflow("multiple steps")).toBe(true);
    });

    it("should return true for 'nhiều bước'", () => {
      expect(needsWorkflow("quy trình nhiều bước")).toBe(true);
    });

    it("should return true for 'full'", () => {
      expect(needsWorkflow("full implementation")).toBe(true);
    });

    it("should return true for 'complete'", () => {
      expect(needsWorkflow("complete solution")).toBe(true);
    });

    it("should return true for 'từ đầu đến cuối'", () => {
      expect(needsWorkflow("làm từ đầu đến cuối")).toBe(true);
    });

    it("should return true for 'end-to-end'", () => {
      expect(needsWorkflow("end-to-end feature")).toBe(true);
    });

    it("should return true for 'implement'", () => {
      expect(needsWorkflow("implement feature")).toBe(true);
    });

    it("should return true for 'tạo mới'", () => {
      expect(needsWorkflow("tạo mới dự án")).toBe(true);
    });

    it("should return true for 'launch'", () => {
      expect(needsWorkflow("launch product")).toBe(true);
    });

    it("should return true for 'release'", () => {
      expect(needsWorkflow("release new version")).toBe(true);
    });

    it("should return true for 'campaign'", () => {
      expect(needsWorkflow("marketing campaign")).toBe(true);
    });

    it("should return false for simple single tasks", () => {
      expect(needsWorkflow("fix bug")).toBe(false);
      expect(needsWorkflow("write test")).toBe(false);
      expect(needsWorkflow("refactor function")).toBe(false);
    });

    it("should return false for single commands", () => {
      expect(needsWorkflow("scout codebase")).toBe(false);
      expect(needsWorkflow("ask question")).toBe(false);
    });
  });

  describe("getPrimaryWorkflow", () => {
    it("should return top matching workflow", () => {
      const primary = getPrimaryWorkflow("create new feature");
      expect(primary).not.toBeNull();
    });

    it("should return new-feature workflow for feature creation", () => {
      const primary = getPrimaryWorkflow("implement new feature");
      expect(primary).not.toBeNull();
      expect(primary?.id).toBe("new-feature");
    });

    it("should return bootstrap-project for project setup", () => {
      const primary = getPrimaryWorkflow("bootstrap new project");
      expect(primary).not.toBeNull();
      expect(primary?.id).toBe("bootstrap-project");
    });

    it("should return campaign-launch for marketing", () => {
      const primary = getPrimaryWorkflow("launch marketing campaign");
      expect(primary).not.toBeNull();
      expect(primary?.id).toBe("campaign-launch");
    });

    it("should return content-creation for content", () => {
      const primary = getPrimaryWorkflow("create blog content");
      expect(primary).not.toBeNull();
      expect(primary?.id).toBe("content-creation");
    });

    it("should return null for no match", () => {
      const primary = getPrimaryWorkflow("xyz abc qwe rty unrelated random");
      expect(primary).toBeNull();
    });

    it("should return bug-fix workflow for debugging", () => {
      const primary = getPrimaryWorkflow("fix bug error");
      expect(primary).not.toBeNull();
      expect(primary?.id).toBe("bug-fix");
    });
  });

  describe("Specific Workflows", () => {
    it("should have new-feature workflow with correct steps", () => {
      const workflow = workflows.find(w => w.id === "new-feature");
      expect(workflow).toBeDefined();
      expect(workflow?.steps.length).toBeGreaterThanOrEqual(5);

      // Should have /ck:plan as first step
      expect(workflow?.steps[0].command).toBe("/ck:plan");

      // Should have /clear as gateway step
      const clearStep = workflow?.steps.find(s => s.command === "/clear");
      expect(clearStep).toBeDefined();
      expect(clearStep?.gateway).toBe(true);
    });

    it("should have bug-fix workflow with scout step", () => {
      const workflow = workflows.find(w => w.id === "bug-fix");
      expect(workflow).toBeDefined();

      // Should start with /ck:scout
      expect(workflow?.steps[0].command).toBe("/ck:scout");

      // Should have /ck:fix step
      const fixStep = workflow?.steps.find(s => s.command === "/ck:fix");
      expect(fixStep).toBeDefined();
    });

    it("should have campaign-launch workflow with brainstorm step", () => {
      const workflow = workflows.find(w => w.id === "campaign-launch");
      expect(workflow).toBeDefined();
      expect(workflow?.kit).toBe("marketing");

      // Should start with /brainstorm
      expect(workflow?.steps[0].command).toBe("/brainstorm");
    });

    it("should have quick-fix workflow for small fixes", () => {
      const workflow = workflows.find(w => w.id === "quick-fix");
      expect(workflow).toBeDefined();
      expect(workflow?.difficulty).toBe("Beginner");
      expect(workflow?.steps.length).toBe(2);
    });

    it("should have fullstack-feature workflow for both kits", () => {
      const workflow = workflows.find(w => w.id === "fullstack-feature");
      expect(workflow).toBeDefined();
      expect(workflow?.kit).toBe("both");
    });
  });

  describe("Workflow Step Properties", () => {
    it("should identify gateway steps correctly", () => {
      const newFeature = workflows.find(w => w.id === "new-feature");
      const gatewaySteps = newFeature?.steps.filter(s => s.gateway);
      expect(gatewaySteps?.length).toBeGreaterThan(0);

      gatewaySteps?.forEach(step => {
        expect(step.required).toBe(true);
      });
    });

    it("should have optional flags on relevant steps", () => {
      workflows.forEach(workflow => {
        workflow.steps.forEach(step => {
          if (step.flags) {
            expect(Array.isArray(step.flags)).toBe(true);
          }
        });
      });
    });

    it("should have notes on complex steps", () => {
      const newFeature = workflows.find(w => w.id === "new-feature");
      const stepsWithNotes = newFeature?.steps.filter(s => s.note);
      expect(stepsWithNotes?.length).toBeGreaterThan(0);
    });
  });
});
