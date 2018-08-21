'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');
const CollectionName = "Tracks";



class TracksDA {


  static findAll$() {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.find({}).toArray());      
  }



  static createTrack$(track) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.insertOne( {...track, _id:track.id} ))
      .mapTo(track);
  }

  static removeTrack$(track) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.deleteOne( {_id:track.id} ))
      .mapTo(track);
  }

  static updateLastPostId$(trackId,lastPostId) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.updateOne( {_id:trackId}, {"$set" : { "lastPostId": lastPostId }} ))
      .mapTo(trackId);
  }

  

}

module.exports = TracksDA 