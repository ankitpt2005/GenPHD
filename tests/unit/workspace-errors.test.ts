import { describe, expect, it } from "vitest";
import { apiErrorResponse } from "../../lib/api/route-error";
import { AuthenticationRequiredError } from "../../lib/workspace/context";
import { OnboardingRequiredError, WorkspacePersistenceError } from "../../lib/workspace/repository";

describe("apiErrorResponse", () => {
  it("maps AuthenticationRequiredError to 401 UNAUTHORIZED", () => {
    const response = apiErrorResponse(new AuthenticationRequiredError());
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHORIZED");
  });

  it("maps OnboardingRequiredError to 403 ONBOARDING_REQUIRED", () => {
    const response = apiErrorResponse(new OnboardingRequiredError());
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("ONBOARDING_REQUIRED");
  });

  it("maps WorkspacePersistenceError to 503 WORKSPACE_UNAVAILABLE", () => {
    const response = apiErrorResponse(new WorkspacePersistenceError());
    expect(response.status).toBe(503);
    expect(response.body.error).toBe("WORKSPACE_UNAVAILABLE");
  });
});
