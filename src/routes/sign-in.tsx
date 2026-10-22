import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '@clerk/tanstack-react-start';

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <SignIn />
    </div>
  );
}
