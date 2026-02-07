import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_FOODS, GET_FOOD_BY_NAME } from '../graphql/food';
import type { AllFoodsData, FoodData, FoodVariables, NutrientValue } from '../types';

const ESSENTIAL_AMINO_ACIDS = [
  { key: 'lysine', label: 'Lysine' },
  { key: 'methionine', label: 'Methionine' },
  { key: 'tryptophan', label: 'Tryptophan' },
  { key: 'leucine', label: 'Leucine' },
  { key: 'isoleucine', label: 'Isoleucine' },
  { key: 'valine', label: 'Valine' },
  { key: 'threonine', label: 'Threonine' },
  { key: 'phenylalanine', label: 'Phenylalanine' },
  { key: 'histidine', label: 'Histidine' },
] as const;

const VITAMINS = [
  { key: 'vitaminA', label: 'Vitamin A' },
  { key: 'vitaminC', label: 'Vitamin C' },
  { key: 'vitaminD', label: 'Vitamin D' },
  { key: 'vitaminE', label: 'Vitamin E' },
  { key: 'vitaminB1', label: 'Vitamin B1' },
  { key: 'vitaminB2', label: 'Vitamin B2' },
  { key: 'vitaminB6', label: 'Vitamin B6' },
  { key: 'vitaminB9', label: 'Vitamin B9' },
  { key: 'vitaminB12', label: 'Vitamin B12' },
] as const;

const MINERALS = [
  { key: 'zinc', label: 'Zinc' },
  { key: 'magnesium', label: 'Magnesium' },
  { key: 'iodine', label: 'Iodine' },
  { key: 'iron', label: 'Iron' },
  { key: 'calcium', label: 'Calcium' },
] as const;

const calculateValue = (nutrient: NutrientValue, grams: number): number => {
  return (nutrient.value * grams) / 100;
};

export const FoodSelector = () => {
  const [selectedFood, setSelectedFood] = useState<string>('');
  const [consumedGramsInput, setConsumedGramsInput] = useState<string>('100');

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

  const consumedGrams = parseFloat(consumedGramsInput) || 0;

  const handleFoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFood(e.target.value);
  };

  const handleGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const filteredValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    setConsumedGramsInput(filteredValue);
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
      >
        <option value="">-- Choose a food --</option>
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

      {foodData?.food && (
        <div className="food-details">
          <div className="food-header">
            <div>
              <h3 className="food-details-title">{foodData.food.name}</h3>
              <div className="food-details-category">{foodData.food.category}</div>
            </div>
            <div className="grams-input-container">
              <label htmlFor="grams-input" className="grams-input-label">
                Consumed (g)
              </label>
              <input
                id="grams-input"
                type="text"
                inputMode="decimal"
                value={consumedGramsInput}
                onChange={handleGramsChange}
                className="grams-input"
                placeholder="100"
              />
            </div>
          </div>

          {/* Macronutrients */}
          <section className="nutrition-section">
            <h4 className="section-title">Macronutrients</h4>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <span className="nutrition-label">Calories</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.calories, consumedGrams).toFixed(1)} {foodData.food.macronutrients.calories.unit}
                </span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Protein</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.protein, consumedGrams).toFixed(2)} {foodData.food.macronutrients.protein.unit}
                </span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Fat</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.fat, consumedGrams).toFixed(2)} {foodData.food.macronutrients.fat.unit}
                </span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Carbs</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.carbs, consumedGrams).toFixed(2)} {foodData.food.macronutrients.carbs.unit}
                </span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Fiber</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.fiber, consumedGrams).toFixed(2)} {foodData.food.macronutrients.fiber.unit}
                </span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Omega-3 ALA</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.omega3ALA, consumedGrams).toFixed(3)} {foodData.food.macronutrients.omega3ALA.unit}
                </span>
              </div>
              <div className="nutrition-item">
                <span className="nutrition-label">Water</span>
                <span className="nutrition-value">
                  {calculateValue(foodData.food.macronutrients.water, consumedGrams).toFixed(1)} {foodData.food.macronutrients.water.unit}
                </span>
              </div>
            </div>
          </section>

          {/* Essential Amino Acids */}
          <section className="nutrition-section">
            <h4 className="section-title">Essential Amino Acids</h4>
            <div className="nutrition-grid">
              {ESSENTIAL_AMINO_ACIDS.map((aminoAcid) => {
                const nutrient = foodData.food.essentialAminoAcids[aminoAcid.key as keyof typeof foodData.food.essentialAminoAcids];
                const calculatedValue = calculateValue(nutrient, consumedGrams);
                return (
                  <div key={aminoAcid.key} className="nutrition-item">
                    <span className="nutrition-label">{aminoAcid.label}</span>
                    <span className="nutrition-value">
                      {calculatedValue.toFixed(2)} {nutrient.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Vitamins */}
          <section className="nutrition-section">
            <h4 className="section-title">Vitamins</h4>
            <div className="nutrition-grid">
              {VITAMINS.map((vitamin) => {
                const nutrient = foodData.food.vitamins[vitamin.key as keyof typeof foodData.food.vitamins];
                const calculatedValue = calculateValue(nutrient, consumedGrams);
                return (
                  <div key={vitamin.key} className="nutrition-item">
                    <span className="nutrition-label">{vitamin.label}</span>
                    <span className="nutrition-value">
                      {calculatedValue.toFixed(3)} {nutrient.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Minerals */}
          <section className="nutrition-section">
            <h4 className="section-title">Minerals</h4>
            <div className="nutrition-grid">
              {MINERALS.map((mineral) => {
                const nutrient = foodData.food.minerals[mineral.key as keyof typeof foodData.food.minerals];
                const calculatedValue = calculateValue(nutrient, consumedGrams);
                return (
                  <div key={mineral.key} className="nutrition-item">
                    <span className="nutrition-label">{mineral.label}</span>
                    <span className="nutrition-value">
                      {calculatedValue.toFixed(2)} {nutrient.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
