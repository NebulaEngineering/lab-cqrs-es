const { ApolloServer, gql } = require('apollo-server');
const Rx = require('rxjs');
const twitterListenerDomain = require('./../domain/TwitterListenerDomain')();


const typeDefs = gql`

  type Event {    
    et: String, 
    etv: String, 
    at: String, 
    aid: String, 
    user: String, 
    av: Int
    }
  
  type TwitterTrack {
    id: String,
    name: String
  }

  type Query {
    twitterTracks: [TwitterTrack]
  }

  type Mutation {
    addTwitterTrack(name: String): Event
    removeTwitterTrack(name: String): Event
  }


`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    twitterTracks: () => twitterListenerDomain.findAllTracks$().toPromise(),
  },
  Mutation: {
    addTwitterTrack: (root, args, context) => twitterListenerDomain.addTrack$(args).toPromise(),
    removeTwitterTrack: (root, args, context) => twitterListenerDomain.removeTrack$(args).toPromise(),
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
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
    obs.next('');
  });
};

module.exports = {
    start$
}
