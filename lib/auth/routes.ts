const workspaceRoots = [
  "/onboarding",
  "/diagnostic",
  "/dashboard",
  "/roadmap",
  "/consensus",
  "/projects",
  "/challenges",
  "/timeline",
  "/memory",
  "/settings",
  "/profile",
  "/notifications",
] as const;

export function isWorkspacePath(pathname: string) {
  return workspaceRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

export function safeWorkspacePath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("\0")) {
    return fallback;
  }

  const pathname = value.split("?")[0] ?? "/";
  return isWorkspacePath(pathname) ? value : fallback;
}
