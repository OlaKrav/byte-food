import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyConsumedFoods } from './DailyConsumedFoods';
import type { ConsumedFood } from '../store/foodStore';

describe('DailyConsumedFoods', () => {
  it('should render empty state when no foods are provided', () => {
    render(<DailyConsumedFoods foods={[]} />);
    expect(screen.getByText(/no foods yet/i)).toBeInTheDocument();
  });

  it('should render a list of consumed foods', () => {
    const mockFoods: ConsumedFood[] = [
      { id: '1', name: 'Apple', weight: 150 },
      { id: '2', name: 'Chicken Breast', weight: 200 },
    ];

    render(<DailyConsumedFoods foods={mockFoods} />);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();

    expect(screen.getByText('150 g')).toBeInTheDocument();
    expect(screen.getByText('200 g')).toBeInTheDocument();

    expect(screen.queryByText(/no foods yet/i)).not.toBeInTheDocument();
  });

  it('should render correctly with a single food item', () => {
    const mockFoods: ConsumedFood[] = [
      { id: '123', name: 'Banana', weight: 100 },
    ];

    const { container } = render(<DailyConsumedFoods foods={mockFoods} />);

    const rows = container.querySelectorAll('.daily-consumed-foods-row');
    expect(rows.length).toBe(2);
  });
});
