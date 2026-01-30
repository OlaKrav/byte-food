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

  type AminoAcids {
    alanine: Float!
    arginine: Float!
    asparagine: Float!
    aspartic_acid: Float!
    cysteine: Float!
    glutamic_acid: Float!
    glutamine: Float!
    glycine: Float!
    histidine: Float!
    isoleucine: Float!
    leucine: Float!
    lysine: Float!
    methionine: Float!
    phenylalanine: Float!
    proline: Float!
    serine: Float!
    threonine: Float!
    tryptophan: Float!
    tyrosine: Float!
    valine: Float!
  }

  type Food {
    id: ID!
    name: String!
    category: String!
    amino_acids_g: AminoAcids!
  }

  type Query {
    me: User
    food(name: String!): Food
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String): AuthPayload!
    authWithGoogle(idToken: String!): AuthPayload!
  }
`;
