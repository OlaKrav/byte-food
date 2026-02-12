import { type ConsumedFood } from '../store/foodStore';

export interface DailyConsumedFoodsProps {
  foods: ConsumedFood[];
}

export const DailyConsumedFoods = ({ foods }: DailyConsumedFoodsProps) => {

  return (
    <div className="daily-consumed-foods">
      <h3 className="daily-consumed-foods-title">Today</h3>
      <div className="daily-consumed-foods-list">
        <div className="daily-consumed-foods-row daily-consumed-foods-header">
          <span className="daily-consumed-foods-name">Name</span>
          <span className="daily-consumed-foods-weight">Weight</span>
        </div>
        {foods.length === 0 ? (
          <div className="daily-consumed-foods-empty">No foods yet</div>
        ) : (
          foods.map((food) => (
            <div key={food.id} className="daily-consumed-foods-row">
              <span className="daily-consumed-foods-name">{food.name}</span>
              <span className="daily-consumed-foods-weight">
                {food.weight} g
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
