import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { FoodSelector, UserHeader, DailyConsumedFoods, DailyNutrients } from '../components';
import { requireAuth } from '../lib/auth';
import { useFoodStore } from '../store/foodStore';
import styles from './Home.module.css';

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
    <div className={styles.appContainer}>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <UserHeader user={user} />
        </div>

        <main className={styles.main}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.pageTitle}>Byte Food</h1>
            <p className={styles.pageSubtitle}>Track and analyze food composition efficiently</p>
          </div>

          <div
            className={
              selectedFood ? styles.contentGrid : styles.contentFull
            }
          >
            <div className={selectedFood ? styles.leftCol : ''}>
              <FoodSelector onFoodSelect={setSelectedFood} />
            </div>

            <aside className={styles.rightCol}>
              {foods.length ? <DailyConsumedFoods foods={foods} /> : null}
              <DailyNutrients />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
