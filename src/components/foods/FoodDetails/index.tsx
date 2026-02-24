import { useState } from 'react';
import type { Food, NutrientValue } from '../../../types';
import { useFoodStore, type IDailyNutrients } from '../../../store/foodStore';
import styles from './FoodDetails.module.css';

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

type AminoAcidItem = (typeof ESSENTIAL_AMINO_ACIDS)[number];

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

type VitaminItem = (typeof VITAMINS)[number];

const MINERALS = [
  { key: 'zinc', label: 'Zinc' },
  { key: 'magnesium', label: 'Magnesium' },
  { key: 'iodine', label: 'Iodine' },
  { key: 'iron', label: 'Iron' },
  { key: 'calcium', label: 'Calcium' },
] as const;

type MineralItem = (typeof MINERALS)[number];

const calculateValue = (nutrient: NutrientValue, grams: number): number => {
  return (nutrient.value * grams) / 100;
};

export interface FoodDetailsProps {
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
    const filteredValue =
      parts.length > 2
        ? parts[0] + '.' + parts.slice(1).join('')
        : numericValue;

    setConsumedGramsInput(filteredValue);
  };

  const calculateAllNutrients = (): IDailyNutrients | null => {
    if (consumedGrams <= 0) {
      return null;
    }

    return {
      essentialAminoAcids: {
        lysine: calculateValue(food.essentialAminoAcids.lysine, consumedGrams),
        methionine: calculateValue(
          food.essentialAminoAcids.methionine,
          consumedGrams
        ),
        tryptophan: calculateValue(
          food.essentialAminoAcids.tryptophan,
          consumedGrams
        ),
        leucine: calculateValue(
          food.essentialAminoAcids.leucine,
          consumedGrams
        ),
        isoleucine: calculateValue(
          food.essentialAminoAcids.isoleucine,
          consumedGrams
        ),
        valine: calculateValue(food.essentialAminoAcids.valine, consumedGrams),
        threonine: calculateValue(
          food.essentialAminoAcids.threonine,
          consumedGrams
        ),
        phenylalanine: calculateValue(
          food.essentialAminoAcids.phenylalanine,
          consumedGrams
        ),
        histidine: calculateValue(
          food.essentialAminoAcids.histidine,
          consumedGrams
        ),
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
    <div className={styles.root}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{food.name}</h3>
          <div className={styles.category}>{food.category}</div>
        </div>
        <div className={styles.gramsWrap}>
          <label htmlFor="grams-input" className={styles.gramsLabel}>
            Consumed (g)
          </label>
          <input
            id="grams-input"
            type="text"
            inputMode="decimal"
            value={consumedGramsInput}
            onChange={handleGramsChange}
            className={styles.gramsInput}
            placeholder="100"
          />
          <button
            type="button"
            onClick={handleAddFood}
            className={styles.addBtn}
            disabled={consumedGrams <= 0}
          >
            Add
          </button>
        </div>
      </div>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Macronutrients</h4>
        <div className={styles.grid}>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Calories</span>
            <span className={styles.itemValue}>
              {calculateValue(
                food.macronutrients.calories,
                consumedGrams
              ).toFixed(1)}{' '}
              {food.macronutrients.calories.unit}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Protein</span>
            <span className={styles.itemValue}>
              {calculateValue(
                food.macronutrients.protein,
                consumedGrams
              ).toFixed(2)}{' '}
              {food.macronutrients.protein.unit}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Fat</span>
            <span className={styles.itemValue}>
              {calculateValue(food.macronutrients.fat, consumedGrams).toFixed(
                2
              )}{' '}
              {food.macronutrients.fat.unit}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Carbs</span>
            <span className={styles.itemValue}>
              {calculateValue(food.macronutrients.carbs, consumedGrams).toFixed(
                2
              )}{' '}
              {food.macronutrients.carbs.unit}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Fiber</span>
            <span className={styles.itemValue}>
              {calculateValue(food.macronutrients.fiber, consumedGrams).toFixed(
                2
              )}{' '}
              {food.macronutrients.fiber.unit}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Omega-3 ALA</span>
            <span className={styles.itemValue}>
              {calculateValue(
                food.macronutrients.omega3ALA,
                consumedGrams
              ).toFixed(3)}{' '}
              {food.macronutrients.omega3ALA.unit}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>Water</span>
            <span className={styles.itemValue}>
              {calculateValue(food.macronutrients.water, consumedGrams).toFixed(
                1
              )}{' '}
              {food.macronutrients.water.unit}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Essential Amino Acids</h4>
        <div className={styles.grid}>
          {ESSENTIAL_AMINO_ACIDS.map((aminoAcid: AminoAcidItem) => {
            const nutrient = food.essentialAminoAcids[aminoAcid.key];
            const calculatedValue = calculateValue(nutrient, consumedGrams);
            return (
              <div key={aminoAcid.key} className={styles.item}>
                <span className={styles.itemLabel}>{aminoAcid.label}</span>
                <span className={styles.itemValue}>
                  {calculatedValue.toFixed(2)} {nutrient.unit}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Vitamins</h4>
        <div className={styles.grid}>
          {VITAMINS.map((vitamin: VitaminItem) => {
            const nutrient = food.vitamins[vitamin.key];
            const calculatedValue = calculateValue(nutrient, consumedGrams);
            return (
              <div key={vitamin.key} className={styles.item}>
                <span className={styles.itemLabel}>{vitamin.label}</span>
                <span className={styles.itemValue}>
                  {calculatedValue.toFixed(3)} {nutrient.unit}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Minerals</h4>
        <div className={styles.grid}>
          {MINERALS.map((mineral: MineralItem) => {
            const nutrient = food.minerals[mineral.key];
            const calculatedValue = calculateValue(nutrient, consumedGrams);
            return (
              <div key={mineral.key} className={styles.item}>
                <span className={styles.itemLabel}>{mineral.label}</span>
                <span className={styles.itemValue}>
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
