import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FoodDetails } from './FoodDetails';
import { useFoodStore } from '../store/foodStore';
import type { Food } from '../types';

vi.mock('../store/foodStore', () => ({
  useFoodStore: vi.fn(),
}));

const useFoodStoreMock = useFoodStore as unknown as Mock;

const mockFood: Food = {
  id: '1',
  name: 'Banana',
  category: 'Fruit',
  macronutrients: {
    calories: { value: 89, unit: 'kcal' },
    protein: { value: 1.1, unit: 'g' },
    fat: { value: 0.3, unit: 'g' },
    carbs: { value: 22.8, unit: 'g' },
    fiber: { value: 2.6, unit: 'g' },
    omega3ALA: { value: 0.027, unit: 'g' },
    water: { value: 74.9, unit: 'ml' },
  },
  essentialAminoAcids: {
    lysine: { value: 50, unit: 'mg' },
    methionine: { value: 8, unit: 'mg' },
    tryptophan: { value: 9, unit: 'mg' },
    leucine: { value: 68, unit: 'mg' },
    isoleucine: { value: 28, unit: 'mg' },
    valine: { value: 47, unit: 'mg' },
    threonine: { value: 28, unit: 'mg' },
    phenylalanine: { value: 49, unit: 'mg' },
    histidine: { value: 77, unit: 'mg' },
  },
  vitamins: {
    vitaminA: { value: 3, unit: 'mcg' },
    vitaminC: { value: 8.7, unit: 'mg' },
    vitaminD: { value: 0, unit: 'mcg' },
    vitaminE: { value: 0.1, unit: 'mg' },
    vitaminB1: { value: 0.03, unit: 'mg' },
    vitaminB2: { value: 0.07, unit: 'mg' },
    vitaminB6: { value: 0.37, unit: 'mg' },
    vitaminB9: { value: 20, unit: 'mcg' },
    vitaminB12: { value: 0, unit: 'mcg' },
  },
  minerals: {
    zinc: { value: 0.15, unit: 'mg' },
    magnesium: { value: 27, unit: 'mg' },
    iodine: { value: 0, unit: 'mcg' },
    iron: { value: 0.26, unit: 'mg' },
    calcium: { value: 5, unit: 'mg' },
  },
};

describe('FoodDetails Component', () => {
  const addFoodSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useFoodStoreMock.mockImplementation((selector) =>
      selector({
        addFood: addFoodSpy,
      })
    );
  });

  it('renders correctly with default weight of 100g', () => {
    render(<FoodDetails food={mockFood} />);

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('89.0 kcal')).toBeInTheDocument();
  });

  it('recalculates nutrients when weight input changes', () => {
    render(<FoodDetails food={mockFood} />);

    const input = screen.getByLabelText(/consumed \(g\)/i);
    fireEvent.change(input, { target: { value: '400' } });

    expect(screen.getByText('356.0 kcal')).toBeInTheDocument();
  });

  it('prevents non-numeric input for grams', () => {
    render(<FoodDetails food={mockFood} />);

    const input = screen.getByLabelText(/consumed \(g\)/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '100abc' } });

    expect(input.value).toBe('100');
  });

  it('calls addFood with correct calculated nutrients on button click', () => {
    render(<FoodDetails food={mockFood} />);

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    expect(addFoodSpy).toHaveBeenCalledTimes(1);

    const callArgs = addFoodSpy.mock.calls[0];
    expect(callArgs[0]).toBe('Banana');
    expect(callArgs[1]).toBe(100);

    expect(callArgs[2].macronutrients.calories).toBe(89);
  });

  it('disables add button when weight is 0 or empty', () => {
    render(<FoodDetails food={mockFood} />);

    const input = screen.getByLabelText(/consumed \(g\)/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: '0' } });
    expect(addButton).toBeDisabled();

    fireEvent.change(input, { target: { value: '' } });
    expect(addButton).toBeDisabled();
  });
});
