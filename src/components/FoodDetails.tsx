import { useState } from 'react';
import type { Food, NutrientValue } from '../types';
import { useFoodStore, type DailyNutrients } from '../store/foodStore';

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

interface FoodDetailsProps {
  food: Food;
}

export const FoodDetails = ({ food }: FoodDetailsProps) => {
  const [consumedGramsInput, setConsumedGramsInput] = useState<string>('100');
  const addFood = useFoodStore((state) => state.addFood);

  const consumedGrams = parseFloat(consumedGramsInput) || 0;

  const handleGramsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    const filteredValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    setConsumedGramsInput(filteredValue);
  };

  const calculateAllNutrients = (): DailyNutrients | null => {
    if (consumedGrams <= 0) {
      return null;
    }

    return {
      essentialAminoAcids: {
        lysine: calculateValue(food.essentialAminoAcids.lysine, consumedGrams),
        methionine: calculateValue(food.essentialAminoAcids.methionine, consumedGrams),
        tryptophan: calculateValue(food.essentialAminoAcids.tryptophan, consumedGrams),
        leucine: calculateValue(food.essentialAminoAcids.leucine, consumedGrams),
        isoleucine: calculateValue(food.essentialAminoAcids.isoleucine, consumedGrams),
        valine: calculateValue(food.essentialAminoAcids.valine, consumedGrams),
        threonine: calculateValue(food.essentialAminoAcids.threonine, consumedGrams),
        phenylalanine: calculateValue(food.essentialAminoAcids.phenylalanine, consumedGrams),
        histidine: calculateValue(food.essentialAminoAcids.histidine, consumedGrams),
      },
      vitamins: {
        vitaminA: calculateValue(food.vitamins.vitaminA, consumedGrams),
        vitaminC: calculateValue(food.vitamins.vitaminC, consumedGrams),
        vitaminD: calculateValue(food.vitamins.vitaminD, consumedGrams),
        vitaminE: calculateValue(food.vitamins.vitaminE, consumedGrams),
        vitaminB1: calculateValue(food.vitamins.vitaminB1, consumedGrams),
        vitaminB2: calculateValue(food.vitamins.vitaminB2, consumedGrams),
        vitaminB6: calculateValue(food.vitamins.vitaminB6, consumedGrams),
        vitaminB9: calculateValue(food.vitamins.vitaminB9, consumedGrams),
        vitaminB12: calculateValue(food.vitamins.vitaminB12, consumedGrams),
      },
      minerals: {
        zinc: calculateValue(food.minerals.zinc, consumedGrams),
        magnesium: calculateValue(food.minerals.magnesium, consumedGrams),
        iodine: calculateValue(food.minerals.iodine, consumedGrams),
        iron: calculateValue(food.minerals.iron, consumedGrams),
        calcium: calculateValue(food.minerals.calcium, consumedGrams),
      },
      macronutrients: {
        calories: calculateValue(food.macronutrients.calories, consumedGrams),
        protein: calculateValue(food.macronutrients.protein, consumedGrams),
        fat: calculateValue(food.macronutrients.fat, consumedGrams),
        omega3ALA: calculateValue(food.macronutrients.omega3ALA, consumedGrams),
        carbs: calculateValue(food.macronutrients.carbs, consumedGrams),
        fiber: calculateValue(food.macronutrients.fiber, consumedGrams),
        water: calculateValue(food.macronutrients.water, consumedGrams),
      },
    };
  };

  const handleAddFood = () => {
    if (consumedGrams <= 0) {
      return;
    }

    const nutrients = calculateAllNutrients();
    if (nutrients) {
      addFood(food.name, consumedGrams, nutrients);
    }
  };

  return (
    <div className="food-details">
      <div className="food-header">
        <div>
          <h3 className="food-details-title">{food.name}</h3>
          <div className="food-details-category">{food.category}</div>
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
          <button
            type="button"
            onClick={handleAddFood}
            className="add-food-button"
            disabled={consumedGrams <= 0}
          >
            Add
          </button>
        </div>
      </div>

      {/* Macronutrients */}
      <section className="nutrition-section">
        <h4 className="section-title">Macronutrients</h4>
        <div className="nutrition-grid">
          <div className="nutrition-item">
            <span className="nutrition-label">Calories</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.calories, consumedGrams).toFixed(1)} {food.macronutrients.calories.unit}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Protein</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.protein, consumedGrams).toFixed(2)} {food.macronutrients.protein.unit}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Fat</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.fat, consumedGrams).toFixed(2)} {food.macronutrients.fat.unit}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Carbs</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.carbs, consumedGrams).toFixed(2)} {food.macronutrients.carbs.unit}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Fiber</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.fiber, consumedGrams).toFixed(2)} {food.macronutrients.fiber.unit}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Omega-3 ALA</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.omega3ALA, consumedGrams).toFixed(3)} {food.macronutrients.omega3ALA.unit}
            </span>
          </div>
          <div className="nutrition-item">
            <span className="nutrition-label">Water</span>
            <span className="nutrition-value">
              {calculateValue(food.macronutrients.water, consumedGrams).toFixed(1)} {food.macronutrients.water.unit}
            </span>
          </div>
        </div>
      </section>

      {/* Essential Amino Acids */}
      <section className="nutrition-section">
        <h4 className="section-title">Essential Amino Acids</h4>
        <div className="nutrition-grid">
          {ESSENTIAL_AMINO_ACIDS.map((aminoAcid) => {
            const nutrient = food.essentialAminoAcids[aminoAcid.key as keyof typeof food.essentialAminoAcids];
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
            const nutrient = food.vitamins[vitamin.key as keyof typeof food.vitamins];
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
            const nutrient = food.minerals[mineral.key as keyof typeof food.minerals];
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
  );
};


