import { create } from 'zustand';

export interface ConsumedFood {
  id: string;
  name: string;
  weight: number;
}

export interface IDailyNutrients {
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

const initialDailyNutrients: IDailyNutrients = {
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

export interface FoodState {
  foods: ConsumedFood[];
  dailyNutrients: IDailyNutrients;
  addFood: (
    foodName: string,
    weight: number,
    nutrients: IDailyNutrients
  ) => void;
  resetDailyNutrients: () => void;
}

const scaleObject = <T extends Record<string, number>>(
  obj: T,
  ratio: number
): T => {
  const entries = Object.entries(obj).map(([key, value]) => [
    key,
    value * ratio,
  ]);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return Object.fromEntries(entries) as T;
};

const scaleNutrients = (
  nutrients: IDailyNutrients,
  weight: number
): IDailyNutrients => {
  const ratio = weight / 100;

  return {
    essentialAminoAcids: scaleObject(nutrients.essentialAminoAcids, ratio),
    vitamins: scaleObject(nutrients.vitamins, ratio),
    minerals: scaleObject(nutrients.minerals, ratio),
    macronutrients: scaleObject(nutrients.macronutrients, ratio),
  };
};

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

      const scaledIncoming = scaleNutrients(nutrients, weight);

      const updatedNutrients: IDailyNutrients = {
        essentialAminoAcids: {
          lysine:
            state.dailyNutrients.essentialAminoAcids.lysine +
            scaledIncoming.essentialAminoAcids.lysine,
          methionine:
            state.dailyNutrients.essentialAminoAcids.methionine +
            scaledIncoming.essentialAminoAcids.methionine,
          tryptophan:
            state.dailyNutrients.essentialAminoAcids.tryptophan +
            scaledIncoming.essentialAminoAcids.tryptophan,
          leucine:
            state.dailyNutrients.essentialAminoAcids.leucine +
            scaledIncoming.essentialAminoAcids.leucine,
          isoleucine:
            state.dailyNutrients.essentialAminoAcids.isoleucine +
            scaledIncoming.essentialAminoAcids.isoleucine,
          valine:
            state.dailyNutrients.essentialAminoAcids.valine +
            scaledIncoming.essentialAminoAcids.valine,
          threonine:
            state.dailyNutrients.essentialAminoAcids.threonine +
            scaledIncoming.essentialAminoAcids.threonine,
          phenylalanine:
            state.dailyNutrients.essentialAminoAcids.phenylalanine +
            scaledIncoming.essentialAminoAcids.phenylalanine,
          histidine:
            state.dailyNutrients.essentialAminoAcids.histidine +
            scaledIncoming.essentialAminoAcids.histidine,
        },
        vitamins: {
          vitaminA:
            state.dailyNutrients.vitamins.vitaminA +
            scaledIncoming.vitamins.vitaminA,
          vitaminC:
            state.dailyNutrients.vitamins.vitaminC +
            scaledIncoming.vitamins.vitaminC,
          vitaminD:
            state.dailyNutrients.vitamins.vitaminD +
            scaledIncoming.vitamins.vitaminD,
          vitaminE:
            state.dailyNutrients.vitamins.vitaminE +
            scaledIncoming.vitamins.vitaminE,
          vitaminB1:
            state.dailyNutrients.vitamins.vitaminB1 +
            scaledIncoming.vitamins.vitaminB1,
          vitaminB2:
            state.dailyNutrients.vitamins.vitaminB2 +
            scaledIncoming.vitamins.vitaminB2,
          vitaminB6:
            state.dailyNutrients.vitamins.vitaminB6 +
            scaledIncoming.vitamins.vitaminB6,
          vitaminB9:
            state.dailyNutrients.vitamins.vitaminB9 +
            scaledIncoming.vitamins.vitaminB9,
          vitaminB12:
            state.dailyNutrients.vitamins.vitaminB12 +
            scaledIncoming.vitamins.vitaminB12,
        },
        minerals: {
          zinc:
            state.dailyNutrients.minerals.zinc + scaledIncoming.minerals.zinc,
          magnesium:
            state.dailyNutrients.minerals.magnesium +
            scaledIncoming.minerals.magnesium,
          iodine:
            state.dailyNutrients.minerals.iodine +
            scaledIncoming.minerals.iodine,
          iron:
            state.dailyNutrients.minerals.iron + scaledIncoming.minerals.iron,
          calcium:
            state.dailyNutrients.minerals.calcium +
            scaledIncoming.minerals.calcium,
        },
        macronutrients: {
          calories:
            state.dailyNutrients.macronutrients.calories +
            scaledIncoming.macronutrients.calories,
          protein:
            state.dailyNutrients.macronutrients.protein +
            scaledIncoming.macronutrients.protein,
          fat:
            state.dailyNutrients.macronutrients.fat +
            scaledIncoming.macronutrients.fat,
          omega3ALA:
            state.dailyNutrients.macronutrients.omega3ALA +
            scaledIncoming.macronutrients.omega3ALA,
          carbs:
            state.dailyNutrients.macronutrients.carbs +
            scaledIncoming.macronutrients.carbs,
          fiber:
            state.dailyNutrients.macronutrients.fiber +
            scaledIncoming.macronutrients.fiber,
          water:
            state.dailyNutrients.macronutrients.water +
            scaledIncoming.macronutrients.water,
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
