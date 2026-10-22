import { clerkMiddleware } from '@clerk/tanstack-react-start/server';
import { createCsrfMiddleware, createStart } from '@tanstack/react-start';

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});

const hasClerk = Boolean(process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY);

export const startInstance = createStart(() => {
  return {
    requestMiddleware: hasClerk ? [csrfMiddleware, clerkMiddleware()] : [csrfMiddleware],
  };
});
