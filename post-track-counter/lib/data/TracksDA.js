'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');
const CollectionName = "Tracks";



class TracksDA {


  static findAll$() {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.find({}).toArray());      
  }


  static incrementTrack$(trackId) {
    const collection = mongoDB.db.collection(CollectionName);
  
    return Rx.Observable.defer(() => collection.updateOne( {_id:trackId}, {"$inc" : { "count": 1 }}, { upsert: true } ))
      .mapTo(trackId);
  }

  

}

module.exports = TracksDA 