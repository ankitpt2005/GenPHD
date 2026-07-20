import { describe, expect, it } from "vitest";
import { isWorkspacePath, safeWorkspacePath } from "../../lib/auth/routes";

describe("workspace route protection", () => {
  it("recognizes the authenticated workspace surface", () => {
    expect(isWorkspacePath("/dashboard")).toBe(true);
    expect(isWorkspacePath("/projects/active")).toBe(true);
    expect(isWorkspacePath("/login")).toBe(false);
  });

  it("only permits internal workspace return paths", () => {
    expect(safeWorkspacePath("/roadmap?focus=now")).toBe("/roadmap?focus=now");
    expect(safeWorkspacePath("https://attacker.example")).toBe("/dashboard");
    expect(safeWorkspacePath("//attacker.example")).toBe("/dashboard");
    expect(safeWorkspacePath("/\\attacker.example")).toBe("/dashboard");
    expect(safeWorkspacePath("/legal")).toBe("/dashboard");
  });
});
