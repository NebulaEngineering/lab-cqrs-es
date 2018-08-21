const { ApolloServer, gql } = require('apollo-server');
const Rx = require('rxjs');
const sampleDomain = require('./../domain/SampleDomain')();


const typeDefs = gql`

  type Event {    
    et: String, 
    etv: String, 
    at: String, 
    aid: String, 
    user: String, 
    av: Int
    }
  
  type Sample {
    id: String,
    title: String
    author: String
  }

  type Query {
    samples: [Sample]
  }

  type Mutation {
    addSample(title: String, author: String): Event 
  }


`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    samples: () => sampleDomain.findAllSamples$().toPromise(),
  },
  Mutation: {
    addSample: (root, args, context) => sampleDomain.addSample$(args).toPromise(),
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
