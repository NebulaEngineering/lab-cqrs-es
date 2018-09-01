const { ApolloServer, gql } = require('apollo-server');
const Rx = require('rxjs');
const nineGagListenerDomain = require('./../domain/NineGagListenerDomain')();


const typeDefs = gql`

  type Event {    
    et: String, 
    etv: String, 
    at: String, 
    aid: String, 
    user: String, 
    av: Int
    }
  
  type NineGagTrack {
    id: String,
    name: String
  }

  type Query {
    NineGagTracks: [NineGagTrack]
  }

  type Mutation {
    addNineGagTrack(name: String): Event
    removeNineGagTrack(name: String): Event
  }


`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    NineGagTracks: () => nineGagListenerDomain.findAllTracks$().toPromise(),
  },
  Mutation: {
    addNineGagTrack: (root, args, context) => nineGagListenerDomain.addTrack$(args).toPromise(),
    removeNineGagTrack: (root, args, context) => nineGagListenerDomain.removeTrack$(args).toPromise(),
  },
};



const start$ = () => {
  return Rx.Observable.create( (obs) => {
    // In the most basic sense, the ApolloServer can be started
    // by passing type definitions (typeDefs) and the resolvers
    // responsible for fetching the data for those types.
    const server = new ApolloServer({ typeDefs, resolvers });

    // This `listen` method launches a web-server.  Existing apps
    // can utilize middleware options, which we'll discuss later.
    server.listen({ port: process.env.GRAPHQL_PORT }).then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
    obs.next('');
  });
};

module.exports = {
    start$
}
