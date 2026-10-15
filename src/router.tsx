import { createRouter, Link } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="font-display text-3xl tracking-tight">Not on the board</h1>
      <p className="text-sm text-muted">That page doesn’t exist in Pitchline: Football 1X2 Predictor App.</p>
      <Link to="/" className="mt-2 inline-flex h-11 items-center text-sm text-accent">
        Back to the board
      </Link>
    </main>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    defaultNotFoundComponent: NotFound,
  });
}
