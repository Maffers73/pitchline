import type { ReactNode } from "react";

/**
 * App-wide client provider mounted once near the root (in `src/routes/__root.tsx`).
 * Better Auth's React client needs no context provider, so this is a passthrough.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
