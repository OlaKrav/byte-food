import { gql } from '@apollo/client';

export const GET_FOOD_BY_NAME = gql`
  query GetFoodByName($name: String!) {
    food(name: $name) {
      id
      name
      category
      essentialAminoAcids {
        lysine {
          value
          unit
        }
        methionine {
          value
          unit
        }
        tryptophan {
          value
          unit
        }
        leucine {
          value
          unit
        }
        isoleucine {
          value
          unit
        }
        valine {
          value
          unit
        }
        threonine {
          value
          unit
        }
        phenylalanine {
          value
          unit
        }
        histidine {
          value
          unit
        }
      }
      vitamins {
        vitaminA {
          value
          unit
        }
        vitaminC {
          value
          unit
        }
        vitaminD {
          value
          unit
        }
        vitaminE {
          value
          unit
        }
        vitaminB1 {
          value
          unit
        }
        vitaminB2 {
          value
          unit
        }
        vitaminB6 {
          value
          unit
        }
        vitaminB9 {
          value
          unit
        }
        vitaminB12 {
          value
          unit
        }
      }
      minerals {
        zinc {
          value
          unit
        }
        magnesium {
          value
          unit
        }
        iodine {
          value
          unit
        }
        iron {
          value
          unit
        }
        calcium {
          value
          unit
        }
      }
      macronutrients {
        calories {
          value
          unit
        }
        protein {
          value
          unit
        }
        fat {
          value
          unit
        }
        omega3ALA {
          value
          unit
        }
        carbs {
          value
          unit
        }
        fiber {
          value
          unit
        }
        water {
          value
          unit
        }
      }
    }
  }
`;

export const GET_ALL_FOODS = gql`
  query GetAllFoods {
    allFoods {
      id
      name
    }
  }
`;
