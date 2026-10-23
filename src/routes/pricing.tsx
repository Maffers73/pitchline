import { PricingTable } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 text-center font-display text-3xl tracking-tight">Unlock Pitchline</h1>
      <p className="mb-8 text-center text-sm text-muted">
        Start a 7-day free trial or subscribe to access the Board and Lab.
      </p>
      <PricingTable />
    </div>
  );
}
