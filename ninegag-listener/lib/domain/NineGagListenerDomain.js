"use strict";

const Rx = require("rxjs");
const TracksDA = require('../data/TracksDA');
const Event = require('@nebulae/event-store').Event;
const uuidv4 = require('uuid/v4');
const eventStore = require('../tools/EventSourcing')().eventStore;
const nineGagDA = require('../data/NineGagDA')();

let instance;

class NineGagListenerDomain {

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
        eventType: 'NineGagTrackAdded',
        eventTypeVersion: 1,
        aggregateType: 'NineGagTrack',
        aggregateId: id,
        data: { name, id },
        user: 'SomeOne'
      }
    );

    return eventStore.emitEvent$(event)
      .do(res => console.log(JSON.stringify(res, null, 2)))
      .map(res => res.storeResult.event);
  }

  removeTrack$({ name }) {
    const id = name;
    const event = new Event(
      {
        eventType: 'NineGagTrackRemoved',
        eventTypeVersion: 1,
        aggregateType: 'NineGagTrack',
        aggregateId: id,
        data: { name, id },
        user: 'SomeOne'
      }
    );

    return eventStore.emitEvent$(event)
      //.do(res => console.log(JSON.stringify(res, null, 2)))
      .map(res => res.storeResult.event);
  }

  //////////////////////////////////////////////////////////////////
  ////////////////////// EVENT SOURCING ////////////////////////////
  //////////////////////////////////////////////////////////////////

  processNineGagTrackAdded$(evt) {
    return Rx.Observable.of(evt)
      .map(evt => {
        return {
          name: evt.data.name,
          id: evt.data.id
        };
      })
      .mergeMap(track => TracksDA.createTrack$(track));
  }

  processNineGagTrackRemoved$(evt) {
    return Rx.Observable.of(evt)
      .map(evt => {
        return {
          name: evt.data.name,
          id: evt.data.id
        };
      })
      .mergeMap(track => TracksDA.removeTrack$(track));
  }



  //////////////////////////////////////////////////////////////////
  ////////////////////// TWITTS LISTENER ///////////////////////////
  //////////////////////////////////////////////////////////////////

  start$() {
    Rx.Observable.timer(1000,5000)
      .mergeMap(tick => TracksDA.findAll$())
      .mergeMap(tracks => Rx.Observable.from(tracks))
      .mergeMap(track =>
        nineGagDA.retrieve$(track.name, track.lastPostId)
          .map(post => {
            return { ...post, track };
          }))
      .mergeMap(post =>
        TracksDA.updateLastPostId$(post.track.id, post.id)
          .mapTo(post))
      .map(post => {
        const id = post.id;
        return new Event(
          {
            eventType: 'MessagePosted',
            eventTypeVersion: 1,
            aggregateType: 'Message',
            aggregateId: id,
            data: {
              id,
              type : post.type,
              url:  post.url,
              title : post.title,
              likes: post.upVoteCount,
              commentsCount: post.commentsCount,
              //comments: post.comments,
              track: post.track.name
            },
            user: '9GAG user'
          }
        );
      })
      .mergeMap(event => eventStore.emitEvent$(event))
      .subscribe(
        (evt) => {
          console.log(JSON.stringify(evt, null, 1));
        },
        (err) => console.error(err),
        () => console.log('9GAG Listener completed!!!!!!')
      );
  }




}

module.exports = () => {
  if (!instance) {
    instance = new NineGagListenerDomain();
    console.log("NineGagListenerDomain Singleton created");
  }
  return instance;
};
