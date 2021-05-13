const express = require('express');
const { ApolloServer } = require('apollo-server-express');

//graphql
const typeDefs = require('./graphql/schema');
const { Query } = require('./graphql/resolvers/query');

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query,
    //mutations
    //user,etc.
  },
});

server.applyMiddleware({ app });

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
