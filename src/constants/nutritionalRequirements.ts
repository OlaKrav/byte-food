export interface NutrientValue {
  value: number;
  unit: string;
}

export interface NutrientRange {
  min: NutrientValue;
  max: NutrientValue;
}

export interface NutritionalRequirements {
  essentialAminoAcids: {
    lysine: NutrientValue;
    methionine: NutrientValue;
    tryptophan: NutrientValue;
    leucine: NutrientValue;
    isoleucine: NutrientValue;
    valine: NutrientValue;
    threonine: NutrientValue;
    phenylalanine: NutrientValue;
    histidine: NutrientValue;
  };

  vitamins: {
    vitaminA: NutrientValue;
    vitaminC: NutrientValue;
    vitaminD: NutrientValue;
    vitaminE: NutrientValue;
    vitaminB1: NutrientValue;
    vitaminB2: NutrientValue;
    vitaminB6: NutrientValue;
    vitaminB9: NutrientValue;
    vitaminB12: NutrientValue;
  };

  minerals: {
    zinc: NutrientValue;
    magnesium: NutrientValue;
    iodine: NutrientValue;
    iron: NutrientValue;
    calcium: NutrientValue;
  };

  macronutrients: {
    calories: NutrientRange;
    protein: NutrientValue;
    fat: NutrientValue;
    omega3ALA: NutrientValue;
    carbs: NutrientRange;
    fiber: NutrientRange;
    water: NutrientValue;
  };
}

export const NUTRITIONAL_REQUIREMENTS_70KG: NutritionalRequirements = {
  essentialAminoAcids: {
    lysine: { value: 2100, unit: 'mg' },
    methionine: { value: 1050, unit: 'mg' },
    tryptophan: { value: 280, unit: 'mg' },
    leucine: { value: 2730, unit: 'mg' },
    isoleucine: { value: 1400, unit: 'mg' },
    valine: { value: 1820, unit: 'mg' },
    threonine: { value: 1050, unit: 'mg' },
    phenylalanine: { value: 1750, unit: 'mg' },
    histidine: { value: 700, unit: 'mg' },
  },

  vitamins: {
    vitaminA: { value: 900, unit: 'mcg' },
    vitaminC: { value: 90, unit: 'mg' },
    vitaminD: { value: 20, unit: 'mcg' },
    vitaminE: { value: 15, unit: 'mg' },
    vitaminB1: { value: 1.2, unit: 'mg' },
    vitaminB2: { value: 1.3, unit: 'mg' },
    vitaminB6: { value: 1.3, unit: 'mg' },
    vitaminB9: { value: 400, unit: 'mcg' },
    vitaminB12: { value: 2.4, unit: 'mcg' },
  },

  minerals: {
    zinc: { value: 15, unit: 'mg' },
    magnesium: { value: 420, unit: 'mg' },
    iodine: { value: 150, unit: 'mcg' },
    iron: { value: 25, unit: 'mg' },
    calcium: { value: 1000, unit: 'mg' },
  },

  macronutrients: {
    calories: {
      min: { value: 2100, unit: 'kcal' },
      max: { value: 2500, unit: 'kcal' },
    },
    protein: { value: 84, unit: 'g' },
    fat: { value: 70, unit: 'g' },
    omega3ALA: { value: 1.6, unit: 'g' },
    carbs: {
      min: { value: 280, unit: 'g' },
      max: { value: 320, unit: 'g' },
    },
    fiber: {
      min: { value: 30, unit: 'g' },
      max: { value: 38, unit: 'g' },
    },
    water: { value: 2100, unit: 'ml' },
  },
};
