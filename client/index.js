const {
  ApolloClient,
  InMemoryCache,
  // ApolloProvider,
  // useQuery,
  // gql,
} = require('@apollo/client');
const React = require('react');
// const { render } = require('react-dom');

const createUploadLink = require('apollo-upload-client/public/createUploadLink.js');
const fetch = require('cross-fetch');

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: createUploadLink({
    uri: 'http://localhost:4000/graphql',
    fetch,
  }),
});