"use strict";

const Rx = require("rxjs");
const SampleDA = require('../data/SampleDA');
const Event = require('@nebulae/event-store').Event;
const uuidv4 = require('uuid/v4');
const eventStore = require('../tools/EventSourcing')().eventStore;

let instance;

class SampleDomain {
  constructor() {
  }

  //////////////////////////////////////////////////////////////////
  //////////////////////// C Q R S /////////////////////////////////
  //////////////////////////////////////////////////////////////////

  findAllSamples$() {
    return SampleDA.findAll$();
  }

  addSample$({ title, author }) {
    const id = uuidv4();
    const event = new Event(
      {
        eventType: 'SampleEvent',
        eventTypeVersion: 1,
        aggregateType: 'Sample',
        aggregateId: id,
        data: { title, author, id },
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
  
  processSampleEvent$(sampleEvent){
    return Rx.Observable.of(sampleEvent)
    .map(evt => {
      return {
        title: evt.data.title,
        author: evt.data.author,
        id: evt.data.id
      };
    })
    .mergeMap(sample => SampleDA.createSample$(sample));
  }


}

module.exports = () => {
  if (!instance) {
    instance = new SampleDomain();
    console.log("SampleDomain Singleton created");
  }
  return instance;
};
