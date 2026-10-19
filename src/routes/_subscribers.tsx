import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { checkSubscription } from '@/lib/stripe/check-subscription';

// TODO: replace with your real getSession from better-auth
async function getSession() {
  // Placeholder — wire to your existing better-auth session helper
  return null;
}

export const Route = createFileRoute('/_subscribers')({
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    const hasAccess = await checkSubscription((session as any).user?.id);
    if (!hasAccess) {
      throw redirect({ to: '/pricing' });
    }
    return { user: (session as any).user };
  },
  component: () => <Outlet />,
});
