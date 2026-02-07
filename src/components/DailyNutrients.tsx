import { useFoodStore } from '../store/foodStore';
import { NUTRITIONAL_REQUIREMENTS_70KG } from '../constants/nutritionalRequirements';

const ESSENTIAL_AMINO_ACIDS = [
  { key: 'lysine', label: 'Lysine', unit: 'mg' },
  { key: 'methionine', label: 'Methionine', unit: 'mg' },
  { key: 'tryptophan', label: 'Tryptophan', unit: 'mg' },
  { key: 'leucine', label: 'Leucine', unit: 'mg' },
  { key: 'isoleucine', label: 'Isoleucine', unit: 'mg' },
  { key: 'valine', label: 'Valine', unit: 'mg' },
  { key: 'threonine', label: 'Threonine', unit: 'mg' },
  { key: 'phenylalanine', label: 'Phenylalanine', unit: 'mg' },
  { key: 'histidine', label: 'Histidine', unit: 'mg' },
] as const;

const VITAMINS = [
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
  { key: 'vitaminB1', label: 'Vitamin B1', unit: 'mg' },
  { key: 'vitaminB2', label: 'Vitamin B2', unit: 'mg' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
  { key: 'vitaminB9', label: 'Vitamin B9', unit: 'mcg' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg' },
] as const;

const MINERALS = [
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
] as const;

export const DailyNutrients = () => {
  const dailyNutrients = useFoodStore((state) => state.dailyNutrients);

  const formatValue = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  const getRequirement = (category: string, key: string): number => {
    if (category === 'essentialAminoAcids') {
      return NUTRITIONAL_REQUIREMENTS_70KG.essentialAminoAcids[key as keyof typeof NUTRITIONAL_REQUIREMENTS_70KG.essentialAminoAcids]?.value || 0;
    }
    if (category === 'vitamins') {
      return NUTRITIONAL_REQUIREMENTS_70KG.vitamins[key as keyof typeof NUTRITIONAL_REQUIREMENTS_70KG.vitamins]?.value || 0;
    }
    if (category === 'minerals') {
      return NUTRITIONAL_REQUIREMENTS_70KG.minerals[key as keyof typeof NUTRITIONAL_REQUIREMENTS_70KG.minerals]?.value || 0;
    }
    if (category === 'macronutrients') {
      const macro = NUTRITIONAL_REQUIREMENTS_70KG.macronutrients[key as keyof typeof NUTRITIONAL_REQUIREMENTS_70KG.macronutrients];
      if ('min' in macro && 'max' in macro) {
        return macro.min.value; // Use min for ranges
      }
      return macro?.value || 0;
    }
    return 0;
  };

  const getPercentage = (current: number, required: number): number => {
    if (required === 0) return 0;
    return (current / required) * 100;
  };

  const getColorClass = (percentage: number): string => {
    if (percentage < 50) return 'nutrient-block-red';
    if (percentage < 80) return 'nutrient-block-yellow';
    return 'nutrient-block-green';
  };

  return (
    <div className="daily-nutrients">
      <h3 className="daily-nutrients-title">Daily Nutrients</h3>

      {/* Macronutrients */}
      <section className="nutrition-section">
        <h4 className="section-title">Macronutrients</h4>
        <div className="nutrition-blocks">
          {[
            { key: 'calories', label: 'Calories', value: dailyNutrients.macronutrients.calories, unit: 'kcal', decimals: 1 },
            { key: 'protein', label: 'Protein', value: dailyNutrients.macronutrients.protein, unit: 'g', decimals: 2 },
            { key: 'fat', label: 'Fat', value: dailyNutrients.macronutrients.fat, unit: 'g', decimals: 2 },
            { key: 'carbs', label: 'Carbs', value: dailyNutrients.macronutrients.carbs, unit: 'g', decimals: 2 },
            { key: 'fiber', label: 'Fiber', value: dailyNutrients.macronutrients.fiber, unit: 'g', decimals: 2 },
            { key: 'omega3ALA', label: 'Omega-3 ALA', value: dailyNutrients.macronutrients.omega3ALA, unit: 'g', decimals: 3 },
            { key: 'water', label: 'Water', value: dailyNutrients.macronutrients.water, unit: 'ml', decimals: 1 },
          ].map((macro) => {
            const required = getRequirement('macronutrients', macro.key);
            const percentage = getPercentage(macro.value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={macro.key} className={`nutrient-block ${colorClass}`}>
                <div className="nutrient-block-label">{macro.label}</div>
                <div className="nutrient-block-value">
                  {formatValue(macro.value, macro.decimals)} / {formatValue(required, macro.decimals)} {macro.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Essential Amino Acids */}
      <section className="nutrition-section">
        <h4 className="section-title">Essential Amino Acids</h4>
        <div className="nutrition-blocks">
          {ESSENTIAL_AMINO_ACIDS.map((aminoAcid) => {
            const value = dailyNutrients.essentialAminoAcids[aminoAcid.key as keyof typeof dailyNutrients.essentialAminoAcids];
            const required = getRequirement('essentialAminoAcids', aminoAcid.key);
            const percentage = getPercentage(value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={aminoAcid.key} className={`nutrient-block ${colorClass}`}>
                <div className="nutrient-block-label">{aminoAcid.label}</div>
                <div className="nutrient-block-value">
                  {formatValue(value, 2)} / {formatValue(required, 2)} {aminoAcid.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Vitamins */}
      <section className="nutrition-section">
        <h4 className="section-title">Vitamins</h4>
        <div className="nutrition-blocks">
          {VITAMINS.map((vitamin) => {
            const value = dailyNutrients.vitamins[vitamin.key as keyof typeof dailyNutrients.vitamins];
            const required = getRequirement('vitamins', vitamin.key);
            const percentage = getPercentage(value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={vitamin.key} className={`nutrient-block ${colorClass}`}>
                <div className="nutrient-block-label">{vitamin.label}</div>
                <div className="nutrient-block-value">
                  {formatValue(value, 3)} / {formatValue(required, 3)} {vitamin.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Minerals */}
      <section className="nutrition-section">
        <h4 className="section-title">Minerals</h4>
        <div className="nutrition-blocks">
          {MINERALS.map((mineral) => {
            const value = dailyNutrients.minerals[mineral.key as keyof typeof dailyNutrients.minerals];
            const required = getRequirement('minerals', mineral.key);
            const percentage = getPercentage(value, required);
            const colorClass = getColorClass(percentage);
            return (
              <div key={mineral.key} className={`nutrient-block ${colorClass}`}>
                <div className="nutrient-block-label">{mineral.label}</div>
                <div className="nutrient-block-value">
                  {formatValue(value, 2)} / {formatValue(required, 2)} {mineral.unit}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

