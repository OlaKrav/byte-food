import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_ALL_FOODS, GET_FOOD_BY_NAME } from '../graphql/food';
import type {
  AllFoodsData,
  FoodData,
  FoodVariables,
} from '../types';

const AMINO_ACIDS = [
  { key: 'alanine', label: 'Alanine' },
  { key: 'arginine', label: 'Arginine' },
  { key: 'asparagine', label: 'Asparagine' },
  { key: 'aspartic_acid', label: 'Aspartic Acid' },
  { key: 'cysteine', label: 'Cysteine' },
  { key: 'glutamic_acid', label: 'Glutamic Acid' },
  { key: 'glutamine', label: 'Glutamine' },
  { key: 'glycine', label: 'Glycine' },
  { key: 'histidine', label: 'Histidine' },
  { key: 'isoleucine', label: 'Isoleucine' },
  { key: 'leucine', label: 'Leucine' },
  { key: 'lysine', label: 'Lysine' },
  { key: 'methionine', label: 'Methionine' },
  { key: 'phenylalanine', label: 'Phenylalanine' },
  { key: 'proline', label: 'Proline' },
  { key: 'serine', label: 'Serine' },
  { key: 'threonine', label: 'Threonine' },
  { key: 'tryptophan', label: 'Tryptophan' },
  { key: 'tyrosine', label: 'Tyrosine' },
  { key: 'valine', label: 'Valine' },
] as const;

export const FoodSelector = () => {
  const [selectedFood, setSelectedFood] = useState<string>('');

  const {
    data: foodsData,
    loading: foodsLoading,
    error: foodsError,
  } = useQuery<AllFoodsData>(GET_ALL_FOODS);
  const {
    data: foodData,
    loading: foodLoading,
    error: foodError,
  } = useQuery<FoodData, FoodVariables>(GET_FOOD_BY_NAME, {
    variables: { name: selectedFood },
    skip: !selectedFood,
  });

  const handleFoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFood(e.target.value);
  };

  if (foodsLoading) {
    return <div className="food-selector-loading">Loading foods...</div>;
  }

  if (foodsError) {
    return (
      <div className="food-selector-error">
        <p className="error">Failed to load foods: {foodsError.message}</p>
      </div>
    );
  }

  return (
    <div className="food-selector">
      <label htmlFor="food-select" className="food-selector-label">
        Select a food:
      </label>
      <select
        id="food-select"
        value={selectedFood}
        onChange={handleFoodChange}
        className="food-selector-select"
      >
        <option value="">-- Choose a food --</option>
        {foodsData?.allFoods.map((food) => (
          <option key={food.id} value={food.name}>
            {food.name}
          </option>
        ))}
      </select>

      {foodLoading && selectedFood && (
        <div className="food-selector-loading">Loading amino acids...</div>
      )}

      {foodError && selectedFood && (
        <div className="food-selector-error">
          <p className="error">Failed to load food data: {foodError.message}</p>
        </div>
      )}

      {foodData?.food && (
        <div className="food-details">
          <h3 className="food-details-title">{foodData.food.name}</h3>
          <div className="food-details-category">
            Category: {foodData.food.category}
          </div>

          <div className="amino-acids-grid">
            <h4 className="amino-acids-title">Amino Acids (g per 100g):</h4>
            <div className="amino-acids-list">
              {AMINO_ACIDS.map((aminoAcid) => (
                <div key={aminoAcid.key} className="amino-acid-item">
                  <span className="amino-acid-name">{aminoAcid.label}:</span>
                  <span className="amino-acid-value">
                    {
                      foodData.food.amino_acids_g[
                        aminoAcid.key
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
