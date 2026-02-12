import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '../components/auth/AuthForm';
import { redirectIfAuthenticated } from '../lib/auth';

export const Route = createFileRoute('/auth')({
  beforeLoad: redirectIfAuthenticated,
  component: Auth,
});

function Auth() {
  return (
    <div className="app-container">
      <AuthForm />
    </div>
  );
}
