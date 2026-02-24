import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyNutrients } from '.';
import {
  useFoodStore,
  type FoodState,
  type IDailyNutrients,
} from '../../../store/foodStore';

vi.mock('../../../store/foodStore', () => ({
  useFoodStore: vi.fn(),
}));

const useFoodStoreMock = useFoodStore as unknown as Mock;

const createEmptyDailyNutrients = () => ({
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

describe('DailyNutrients Component', () => {
  const setupMockStore = (
    nutrientsOverrides: Partial<IDailyNutrients> = {}
  ) => {
    useFoodStoreMock.mockImplementation(
      (selector: (state: FoodState) => unknown) => {
        const mockState: FoodState = {
          foods: [],
          dailyNutrients: {
            ...createEmptyDailyNutrients(),
            ...nutrientsOverrides,
          },
          addFood: vi.fn(),
          resetDailyNutrients: vi.fn(),
        };

        return selector(mockState);
      }
    );
  };

  it('renders and displays value from store with correct decimals', () => {
    setupMockStore({
      macronutrients: {
        ...createEmptyDailyNutrients().macronutrients,
        calories: 1250.55,
      },
    });

    render(<DailyNutrients />);

    expect(screen.getByText(/1250.5/)).toBeInTheDocument();
  });

  it('verifies low nutrient intake shows red variant', () => {
    setupMockStore({
      vitamins: {
        ...createEmptyDailyNutrients().vitamins,
        vitaminC: 0.1,
      },
    });

    render(<DailyNutrients />);

    const vitaminCBlock = screen.getByText('Vitamin C').closest('[data-testid="nutrient-block"]');
    expect(vitaminCBlock).toHaveAttribute('data-variant', 'red');
  });
});
