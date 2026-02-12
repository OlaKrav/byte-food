import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { FoodSelector } from '../components/FoodSelector';
import { DailyConsumedFoods } from '../components/DailyConsumedFoods';
import { DailyNutrients } from '../components/DailyNutrients';
import { requireAuth } from '../lib/auth';
import { useFoodStore } from '../store/foodStore';
import { UserHeader } from '../components/auth/UserHeader';

export const Route = createFileRoute('/')({
  loader: () => requireAuth(),
  component: Home,
});

function Home() {
  const loaderData = Route.useLoaderData();
  const user = loaderData.me;
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const foods = useFoodStore((state) => state.foods);

  return (
    <div className="app-container">
      <div className="dashboard">
        <UserHeader user={user} />

        <main>
          <div className="welcome-section">
            <h1>Byte Food</h1>
            <p>Track and analyze food composition efficiently</p>
          </div>

          <div
            className={
              selectedFood ? 'food-selector-layout' : 'daily-nutrients-main'
            }
          >
            <div className={selectedFood ? 'food-section' : ''}>
              <FoodSelector onFoodSelect={setSelectedFood} />
            </div>

            <aside
              className={
                selectedFood ? 'food-selector-sidebar' : 'daily-nutrients-aside'
              }
            >
              {foods.length ? <DailyConsumedFoods foods={foods} /> : null}
              <DailyNutrients />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
