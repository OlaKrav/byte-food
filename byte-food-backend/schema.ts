export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type NutrientValue {
    value: Float!
    unit: String!
  }

  type NutrientRange {
    min: NutrientValue!
    max: NutrientValue!
  }

  type EssentialAminoAcids {
    lysine: NutrientValue!
    methionine: NutrientValue!
    tryptophan: NutrientValue!
    leucine: NutrientValue!
    isoleucine: NutrientValue!
    valine: NutrientValue!
    threonine: NutrientValue!
    phenylalanine: NutrientValue!
    histidine: NutrientValue!
  }

  type Vitamins {
    vitaminA: NutrientValue!
    vitaminC: NutrientValue!
    vitaminD: NutrientValue!
    vitaminE: NutrientValue!
    vitaminB1: NutrientValue!
    vitaminB2: NutrientValue!
    vitaminB6: NutrientValue!
    vitaminB9: NutrientValue!
    vitaminB12: NutrientValue!
  }

  type Minerals {
    zinc: NutrientValue!
    magnesium: NutrientValue!
    iodine: NutrientValue!
    iron: NutrientValue!
    calcium: NutrientValue!
  }

  type Macronutrients {
    calories: NutrientValue!
    protein: NutrientValue!
    fat: NutrientValue!
    omega3ALA: NutrientValue!
    carbs: NutrientValue!
    fiber: NutrientValue!
    water: NutrientValue!
  }

  type Food {
    id: ID!
    name: String!
    category: String!
    essentialAminoAcids: EssentialAminoAcids!
    vitamins: Vitamins!
    minerals: Minerals!
    macronutrients: Macronutrients!
  }

  type FoodName {
    id: ID!
    name: String!
  }

  type Query {
    me: User
    food(name: String!): Food
    allFoods: [FoodName!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String): AuthPayload!
    authWithGoogle(idToken: String!): AuthPayload!
    refreshToken: AuthPayload!
    logout: Boolean!
  }
`;
