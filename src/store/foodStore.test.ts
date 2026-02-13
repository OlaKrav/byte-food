import { describe, it, expect, beforeEach } from 'vitest';
import { useFoodStore, type IDailyNutrients } from './foodStore';

const createEmptyNutrients = (): IDailyNutrients => ({
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
  minerals: { zinc: 0, magnesium: 0, iodine: 0, iron: 0, calcium: 0 },
  macronutrients: {
    calories: 0,
    protein: 0,
    fat: 0,
    omega3ALA: 0,
    carbs: 0,
    fiber: 0,
    water: 0,
  },
});

describe('useFoodStore', () => {
  beforeEach(() => {
    useFoodStore.getState().resetDailyNutrients();
  });

  it('should have initial state', () => {
    const state = useFoodStore.getState();
    expect(state.foods).toEqual([]);
    expect(state.dailyNutrients.macronutrients.calories).toBe(0);
  });

  it('should add food and accumulate nutrients', () => {
    const testNutrients = createEmptyNutrients();
    testNutrients.macronutrients.calories = 500;
    testNutrients.macronutrients.protein = 20;

    useFoodStore.getState().addFood('Apple', 150, testNutrients);

    let state = useFoodStore.getState();
    expect(state.foods).toHaveLength(1);
    expect(state.foods[0].name).toBe('Apple');
    expect(state.dailyNutrients.macronutrients.calories).toBe(500);

    useFoodStore.getState().addFood('Banana', 100, testNutrients);

    state = useFoodStore.getState();
    expect(state.foods).toHaveLength(2);
    expect(state.dailyNutrients.macronutrients.calories).toBe(1000);
    expect(state.dailyNutrients.macronutrients.protein).toBe(40);
  });

  it('should reset state correctly', () => {
    const testNutrients = createEmptyNutrients();
    testNutrients.macronutrients.calories = 100;

    useFoodStore.getState().addFood('Test Food', 100, testNutrients);
    useFoodStore.getState().resetDailyNutrients();

    const state = useFoodStore.getState();
    expect(state.foods).toEqual([]);
    expect(state.dailyNutrients.macronutrients.calories).toBe(0);
  });

  it('should correctly sum specific nested nutrients like vitamins', () => {
    const firstPortion = createEmptyNutrients();
    firstPortion.vitamins.vitaminC = 10;

    const secondPortion = createEmptyNutrients();
    secondPortion.vitamins.vitaminC = 25;

    useFoodStore.getState().addFood('Orange', 100, firstPortion);
    useFoodStore.getState().addFood('Lemon', 200, secondPortion);

    const state = useFoodStore.getState();
    expect(state.dailyNutrients.vitamins.vitaminC).toBe(35);
  });
});
