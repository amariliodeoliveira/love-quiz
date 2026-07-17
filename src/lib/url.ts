/** True for an in-app path (e.g. from a `?from=` param), false for anything that could redirect off-site. */
export function isSafeRedirectTarget(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}
