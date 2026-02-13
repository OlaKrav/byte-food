import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_FOODS, GET_FOOD_BY_NAME } from '../graphql/food';
import type { AllFoodsData, FoodData, FoodVariables } from '../types';
import { FoodDetails } from './FoodDetails';

export interface FoodSelectorProps {
  onFoodSelect?: (foodName: string | null) => void;
}

export const FoodSelector = ({ onFoodSelect }: FoodSelectorProps) => {
  const [selectedFood, setSelectedFood] = useState<string>('');

  const {
    data: foodsData,
    loading: foodsLoading,
    error: foodsError,
  } = useQuery<AllFoodsData>(GET_ALL_FOODS);
  const {
    data: foodData,
    loading: foodLoading,
    error: foodError,
  } = useQuery<FoodData, FoodVariables>(GET_FOOD_BY_NAME, {
    variables: { name: selectedFood },
    skip: !selectedFood,
  });

  const handleFoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFood(value);
    onFoodSelect?.(value || null);
  };

  if (foodsLoading) {
    return <div className="food-selector-loading">Loading foods...</div>;
  }

  if (foodsError) {
    return (
      <div className="food-selector-error">
        <p className="error">Failed to load foods: {foodsError.message}</p>
      </div>
    );
  }

  return (
    <div className="food-selector">
      <label htmlFor="food-select" className="food-selector-label">
        Select a food:
      </label>
      <select
        id="food-select"
        value={selectedFood}
        onChange={handleFoodChange}
        className="food-selector-select"
        data-testid="food-select"
      >
        <option value="">Choose a food</option>
        {foodsData?.allFoods.map((food) => (
          <option key={food.id} value={food.name}>
            {food.name}
          </option>
        ))}
      </select>

      {foodLoading && selectedFood && (
        <div className="food-selector-loading">Loading food data...</div>
      )}

      {foodError && selectedFood && (
        <div className="food-selector-error">
          <p className="error">Failed to load food data: {foodError.message}</p>
        </div>
      )}

      {foodData?.food && <FoodDetails food={foodData.food} />}
    </div>
  );
};
