import { gql } from '@apollo/client';

export const GET_FOOD_BY_NAME = gql`
  query GetFoodByName($name: String!) {
    food(name: $name) {
      id
      name
      category
      amino_acids_g {
        alanine
        arginine
        asparagine
        aspartic_acid
        cysteine
        glutamic_acid
        glutamine
        glycine
        histidine
        isoleucine
        leucine
        lysine
        methionine
        phenylalanine
        proline
        serine
        threonine
        tryptophan
        tyrosine
        valine
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
