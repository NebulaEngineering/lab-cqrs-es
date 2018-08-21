"use strict";

const Rx = require("rxjs");
const TracksDA = require('../data/TracksDA');
const Event = require('@nebulae/event-store').Event;
const uuidv4 = require('uuid/v4');
const eventStore = require('../tools/EventSourcing')().eventStore;

let instance;

class TwitterListenerDomain {
  constructor() {
  }


  //////////////////////////////////////////////////////////////////
  //////////////////////// C Q R S /////////////////////////////////
  //////////////////////////////////////////////////////////////////

  findAllTracks$() {
    return TracksDA.findAll$();
  }

  addTrack$({ name }) {
    const id = name;
    const event = new Event(
      {
        eventType: 'TwitterTrackAdded',
        eventTypeVersion: 1,
        aggregateType: 'TwitterTrack',
        aggregateId: id,
        data: { name, id},
        user: 'SomeOne'
      }
    );

    return eventStore.emitEvent$(event)
    .do(res => console.log(JSON.stringify(res,null,2)))
    .map(res => res.storeResult.event);
  }

  removeTrack$({ name }) {
    const id = name;
    const event = new Event(
      {
        eventType: 'TwitterTrackRemoved',
        eventTypeVersion: 1,
        aggregateType: 'TwitterTrack',
        aggregateId: id,
        data: { name, id},
        user: 'SomeOne'
      }
    );

    return eventStore.emitEvent$(event)
    .do(res => console.log(JSON.stringify(res,null,2)))
    .map(res => res.storeResult.event);
  }

  //////////////////////////////////////////////////////////////////
  ////////////////////// EVENT SOURCING ////////////////////////////
  //////////////////////////////////////////////////////////////////
  
  processTwitterTrackAdded$(evt){
    return Rx.Observable.of(evt)
    .map(evt => {
      return {
        name: evt.data.name,
        id: evt.data.id
      };
    })
    .mergeMap(track => TracksDA.createTrack$(track));
  }

  processTwitterTrackRemoved$(evt){
    return Rx.Observable.of(evt)
    .map(evt => {
      return {
        name: evt.data.name,
        id: evt.data.id
      };
    })
    .mergeMap(track => TracksDA.removeTrack$(track));
  }


}

module.exports = () => {
  if (!instance) {
    instance = new TwitterListenerDomain();
    console.log("TwitterListenerDomain Singleton created");
  }
  return instance;
};
