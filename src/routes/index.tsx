import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { FoodSelector } from '../components/FoodSelector';
import { UserHeader } from '../components/UserHeader';
import { DailyNutrients } from '../components/DailyNutrients';
import { requireAuth } from '../lib/auth';

export const Route = createFileRoute('/')({
  loader: () => requireAuth(),
  component: Home,
});

function Home() {
  const loaderData = Route.useLoaderData();
  const user = loaderData.me;
  const [selectedFood, setSelectedFood] = useState<string | null>(null);

  return (
    <div className="app-container">
      <div className="dashboard">
        <UserHeader user={user} />

        <main>
          <div className="welcome-section">
            <h1>Byte Food</h1>
            <p>Track and analyze food composition efficiently</p>
          </div>

          {!selectedFood ? (
            <>
              <FoodSelector onFoodSelect={setSelectedFood} />
              <div className="daily-nutrients-main">
                <DailyNutrients />
              </div>
            </>
          ) : (
            <div className="food-selector-layout">
              <div className="food-section">
                <FoodSelector onFoodSelect={setSelectedFood} />
              </div>
              <aside className="food-selector-sidebar">
                <DailyNutrients />
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
