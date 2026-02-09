import { create } from 'zustand';

export interface ConsumedFood {
  id: string;
  name: string;
  weight: number;
}

export interface DailyNutrients {
  essentialAminoAcids: {
    lysine: number;
    methionine: number;
    tryptophan: number;
    leucine: number;
    isoleucine: number;
    valine: number;
    threonine: number;
    phenylalanine: number;
    histidine: number;
  };

  vitamins: {
    vitaminA: number;
    vitaminC: number;
    vitaminD: number;
    vitaminE: number;
    vitaminB1: number;
    vitaminB2: number;
    vitaminB6: number;
    vitaminB9: number;
    vitaminB12: number;
  };

  minerals: {
    zinc: number;
    magnesium: number;
    iodine: number;
    iron: number;
    calcium: number;
  };

  macronutrients: {
    calories: number;
    protein: number;
    fat: number;
    omega3ALA: number;
    carbs: number;
    fiber: number;
    water: number;
  };
}

const initialDailyNutrients: DailyNutrients = {
  essentialAminoAcids: {
    lysine: 0,
    methionine: 0,
    tryptophan: 0,
    leucine: 0,
    isoleucine: 0,
    valine: 0,
    threonine: 0,
    phenylalanine: 0,
    histidine: 0,
  },
  vitamins: {
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminB1: 0,
    vitaminB2: 0,
    vitaminB6: 0,
    vitaminB9: 0,
    vitaminB12: 0,
  },
  minerals: {
    zinc: 0,
    magnesium: 0,
    iodine: 0,
    iron: 0,
    calcium: 0,
  },
  macronutrients: {
    calories: 0,
    protein: 0,
    fat: 0,
    omega3ALA: 0,
    carbs: 0,
    fiber: 0,
    water: 0,
  },
};

interface FoodState {
  foods: ConsumedFood[];
  dailyNutrients: DailyNutrients;
  addFood: (
    foodName: string,
    weight: number,
    nutrients: DailyNutrients
  ) => void;
  resetDailyNutrients: () => void;
}

export const useFoodStore = create<FoodState>((set) => ({
  foods: [],
  dailyNutrients: initialDailyNutrients,

  addFood: (foodName, weight, nutrients) =>
    set((state) => {
      const newFood: ConsumedFood = {
        id: `${Date.now()}-${Math.random()}`,
        name: foodName,
        weight,
      };

      const updatedNutrients: DailyNutrients = {
        essentialAminoAcids: {
          lysine:
            state.dailyNutrients.essentialAminoAcids.lysine +
            nutrients.essentialAminoAcids.lysine,
          methionine:
            state.dailyNutrients.essentialAminoAcids.methionine +
            nutrients.essentialAminoAcids.methionine,
          tryptophan:
            state.dailyNutrients.essentialAminoAcids.tryptophan +
            nutrients.essentialAminoAcids.tryptophan,
          leucine:
            state.dailyNutrients.essentialAminoAcids.leucine +
            nutrients.essentialAminoAcids.leucine,
          isoleucine:
            state.dailyNutrients.essentialAminoAcids.isoleucine +
            nutrients.essentialAminoAcids.isoleucine,
          valine:
            state.dailyNutrients.essentialAminoAcids.valine +
            nutrients.essentialAminoAcids.valine,
          threonine:
            state.dailyNutrients.essentialAminoAcids.threonine +
            nutrients.essentialAminoAcids.threonine,
          phenylalanine:
            state.dailyNutrients.essentialAminoAcids.phenylalanine +
            nutrients.essentialAminoAcids.phenylalanine,
          histidine:
            state.dailyNutrients.essentialAminoAcids.histidine +
            nutrients.essentialAminoAcids.histidine,
        },
        vitamins: {
          vitaminA:
            state.dailyNutrients.vitamins.vitaminA +
            nutrients.vitamins.vitaminA,
          vitaminC:
            state.dailyNutrients.vitamins.vitaminC +
            nutrients.vitamins.vitaminC,
          vitaminD:
            state.dailyNutrients.vitamins.vitaminD +
            nutrients.vitamins.vitaminD,
          vitaminE:
            state.dailyNutrients.vitamins.vitaminE +
            nutrients.vitamins.vitaminE,
          vitaminB1:
            state.dailyNutrients.vitamins.vitaminB1 +
            nutrients.vitamins.vitaminB1,
          vitaminB2:
            state.dailyNutrients.vitamins.vitaminB2 +
            nutrients.vitamins.vitaminB2,
          vitaminB6:
            state.dailyNutrients.vitamins.vitaminB6 +
            nutrients.vitamins.vitaminB6,
          vitaminB9:
            state.dailyNutrients.vitamins.vitaminB9 +
            nutrients.vitamins.vitaminB9,
          vitaminB12:
            state.dailyNutrients.vitamins.vitaminB12 +
            nutrients.vitamins.vitaminB12,
        },
        minerals: {
          zinc: state.dailyNutrients.minerals.zinc + nutrients.minerals.zinc,
          magnesium:
            state.dailyNutrients.minerals.magnesium +
            nutrients.minerals.magnesium,
          iodine:
            state.dailyNutrients.minerals.iodine + nutrients.minerals.iodine,
          iron: state.dailyNutrients.minerals.iron + nutrients.minerals.iron,
          calcium:
            state.dailyNutrients.minerals.calcium + nutrients.minerals.calcium,
        },
        macronutrients: {
          calories:
            state.dailyNutrients.macronutrients.calories +
            nutrients.macronutrients.calories,
          protein:
            state.dailyNutrients.macronutrients.protein +
            nutrients.macronutrients.protein,
          fat:
            state.dailyNutrients.macronutrients.fat +
            nutrients.macronutrients.fat,
          omega3ALA:
            state.dailyNutrients.macronutrients.omega3ALA +
            nutrients.macronutrients.omega3ALA,
          carbs:
            state.dailyNutrients.macronutrients.carbs +
            nutrients.macronutrients.carbs,
          fiber:
            state.dailyNutrients.macronutrients.fiber +
            nutrients.macronutrients.fiber,
          water:
            state.dailyNutrients.macronutrients.water +
            nutrients.macronutrients.water,
        },
      };

      return {
        foods: [...state.foods, newFood],
        dailyNutrients: updatedNutrients,
      };
    }),

  resetDailyNutrients: () =>
    set(() => ({
      foods: [],
      dailyNutrients: initialDailyNutrients,
    })),
}));
