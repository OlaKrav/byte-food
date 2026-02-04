import { createFileRoute } from '@tanstack/react-router';
import { FoodSelector } from '../components/FoodSelector';
import { UserHeader } from '../components/UserHeader';
import { requireAuth } from '../lib/auth';

export const Route = createFileRoute('/')({
  loader: () => requireAuth(),
  component: Home,
});

function Home() {
  const loaderData = Route.useLoaderData();
  const user = loaderData.me;

  return (
    <div className="app-container">
      <div className="dashboard">
        <UserHeader user={user} />

        <main>
          <div className="welcome-section">
            <h1>Amino Acid Database</h1>
            <p>Track and analyze food composition efficiently.</p>
          </div>
          <FoodSelector />
        </main>
      </div>
    </div>
  );
}
