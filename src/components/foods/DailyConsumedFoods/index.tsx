import type { ConsumedFood } from '../../../store/foodStore';
import styles from './DailyConsumedFoods.module.css';

export interface DailyConsumedFoodsProps {
  foods: ConsumedFood[];
}

export const DailyConsumedFoods = ({ foods }: DailyConsumedFoodsProps) => {
  return (
    <div className={styles.root} data-testid="daily-consumed-foods">
      <div className={styles.list}>
        <div className={`${styles.row} ${styles.header}`} data-testid="consumed-foods-header">
          <span className={styles.name}>Name</span>
          <span className={styles.weight}>Weight</span>
        </div>
        {foods.length === 0 ? (
          <div className={styles.empty}>No foods yet</div>
        ) : (
          foods.map((food) => (
            <div key={food.id} className={styles.row} data-testid="consumed-food-row">
              <span className={styles.name}>{food.name}</span>
              <span className={styles.weight}>
                {food.weight} g
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
