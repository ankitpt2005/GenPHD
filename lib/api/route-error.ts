import { AuthenticationRequiredError } from "../workspace/context";
import { WorkspacePersistenceError } from "../workspace/repository";

export function apiErrorResponse(error: unknown) {
  if (error instanceof AuthenticationRequiredError) {
    return { body: { error: "UNAUTHORIZED", message: error.message }, status: 401 };
  }

  if (error instanceof WorkspacePersistenceError) {
    return { body: { error: "WORKSPACE_UNAVAILABLE", message: error.message }, status: 503 };
  }

  return { body: { error: "WORKFLOW_FAILED", message: "We could not complete that request. Please try again." }, status: 500 };
}
