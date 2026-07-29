import { describe, expect, it } from "vitest";
import { apiErrorResponse } from "../../lib/api/route-error";
import { AuthenticationRequiredError } from "../../lib/workspace/context";
import { WorkspacePersistenceError } from "../../lib/workspace/repository";

describe("apiErrorResponse", () => {
  it("maps AuthenticationRequiredError to 401 UNAUTHORIZED", () => {
    const response = apiErrorResponse(new AuthenticationRequiredError());
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("UNAUTHORIZED");
  });

  it("maps WorkspacePersistenceError to 503 WORKSPACE_UNAVAILABLE", () => {
    const response = apiErrorResponse(new WorkspacePersistenceError());
    expect(response.status).toBe(503);
    expect(response.body.error).toBe("WORKSPACE_UNAVAILABLE");
  });
});
