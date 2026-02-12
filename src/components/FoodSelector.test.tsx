import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FoodSelector } from './FoodSelector';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_FOODS, GET_FOOD_BY_NAME } from '../graphql/food';
import type { Mock } from 'vitest';
import type { FoodDetailsProps } from './FoodDetails';

vi.mock('@apollo/client/react');

vi.mock('./FoodDetails', () => ({
  FoodDetails: ({ food }: FoodDetailsProps) => (
    <div data-testid="food-details-mock">{food.name} Details</div>
  ),
}));

const mockedUseQuery = useQuery as unknown as Mock;

describe('FoodSelector', () => {
  const mockOnFoodSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseQuery.mockImplementation((query, options) => {
      if (query === GET_ALL_FOODS) {
        return {
          data: {
            allFoods: [
              { id: '1', name: 'Apple' },
              { id: '2', name: 'Banana' },
            ],
          },
          loading: false,
          error: undefined,
        };
      }
      if (query === GET_FOOD_BY_NAME) {
        if (options?.variables?.name === 'Apple') {
          return {
            data: { food: { id: '1', name: 'Apple', category: 'Fruit' } },
            loading: false,
            error: undefined,
          };
        }
        return { data: undefined, loading: false, error: undefined };
      }
      return { data: undefined, loading: false };
    });
  });

  it('renders loading state for the initial food list', () => {
    mockedUseQuery.mockReturnValueOnce({ loading: true });
    render(<FoodSelector />);
    expect(screen.getByText(/Loading foods.../i)).toBeInTheDocument();
  });

  it('populates the select dropdown with foods', () => {
    render(<FoodSelector />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('triggers onFoodSelect and fetches food details on change', () => {
    render(<FoodSelector onFoodSelect={mockOnFoodSelect} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Apple' } });

    expect(mockOnFoodSelect).toHaveBeenCalledWith('Apple');
    expect(screen.getByTestId('food-details-mock')).toHaveTextContent(
      'Apple Details'
    );
  });

  it('shows error message if list loading fails', () => {
    mockedUseQuery.mockImplementation((query) => {
      if (query === GET_ALL_FOODS) {
        return {
          data: undefined,
          loading: false,
          error: { message: 'Server Down' },
        };
      }
      return { data: undefined, loading: false };
    });

    render(<FoodSelector />);
    expect(
      screen.getByText(/Failed to load foods: Server Down/i)
    ).toBeInTheDocument();
  });

  it('shows loading state specifically for food details', () => {
    mockedUseQuery.mockImplementation((query, options) => {
      if (query === GET_ALL_FOODS) {
        return {
          data: { allFoods: [{ id: '1', name: 'Apple' }] },
          loading: false,
        };
      }
      if (query === GET_FOOD_BY_NAME && options?.variables?.name === 'Apple') {
        return { data: undefined, loading: true };
      }
      return { data: undefined, loading: false };
    });

    render(<FoodSelector />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Apple' } });

    expect(screen.getByText(/Loading food data.../i)).toBeInTheDocument();
  });
});
