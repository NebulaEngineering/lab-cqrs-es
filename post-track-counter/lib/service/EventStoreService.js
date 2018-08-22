"use strict";
const Rx = require("rxjs");
const eventSourcing = require("../tools/EventSourcing")();
const twitterListenerDomain = require("../domain/PostCounterDomain")();
const BACKEND_KEY = 'PostTrackCounter'

let instance;

class EventStoreService {
  constructor() {
    this.functionMap = this.generateFunctionMap();
    this.subscriptions = [];
    this.aggregateEventsArray = this.generateAggregateEventsArray();
  }

  generateFunctionMap() {
    return {
      MessagePosted: {
        fn: twitterListenerDomain.processMessagePosted$,
        obj: twitterListenerDomain
      }
    };
  }

  /**
   * Generates a map that assocs each AggretateType withs its events
   */
  generateAggregateEventsArray() {
    return [      
      {
        aggregateType: "Message",
        eventType: "MessagePosted"
      }
    ]
  }



  //#region Boring code :P 

  /**
   * Starts listening to the EventStore
   * Returns observable that resolves to each subscribe agregate/event
   *    emit value: { aggregateType, eventType, handlerName}
   */
  start$() {
    //default error handler
    const onErrorHandler = error => {
      console.error("Error handling  EventStore incoming event", error);
      process.exit(1);
    };
    //default onComplete handler
    const onCompleteHandler = () => {
      () => console.log("EventStore incoming event subscription completed");
    };
    console.log("EventStoreService starting ...");

    return Rx.Observable.from(this.aggregateEventsArray)
            .map(aggregateEvent => { return { ...aggregateEvent, onErrorHandler, onCompleteHandler } })
            .map(params => this.subscribeEventHandler(params));
  }

  /**
   * Stops listening to the Event store
   * Returns observable that resolves to each unsubscribed subscription as string
   */
  stop$() {
    return Rx.Observable.from(this.subscriptions).map(subscription => {
      subscription.subscription.unsubscribe();
      return `Unsubscribed: aggregateType=${aggregateType}, eventType=${eventType}, handlerName=${handlerName}`;
    });
  }

  /**
     * Create a subscrition to the event store and returns the subscription info     
     * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
     * @return { aggregateType, eventType, handlerName  }
     */
    subscribeEventHandler({ aggregateType, eventType, onErrorHandler, onCompleteHandler }) {
      const handler = this.functionMap[eventType];
      const subscription =
          //MANDATORY:  AVOIDS ACK REGISTRY DUPLICATIONS
          eventSourcing.eventStore.ensureAcknowledgeRegistry$(aggregateType)
              .mergeMap(() => eventSourcing.eventStore.getEventListener$(aggregateType,BACKEND_KEY,false))
              .filter(evt => evt.et === eventType)
              .mergeMap(evt => Rx.Observable.concat(
                  handler.fn.call(handler.obj, evt),
                  //MANDATORY:  ACKWOWLEDGE THIS EVENT WAS PROCESSED
                  eventSourcing.eventStore.acknowledgeEvent$(evt, BACKEND_KEY),
              ))
              .subscribe(
                  (evt) => {
                    // console.log(`EventStoreService: ${eventType} process: ${evt}`);
                  },
                  onErrorHandler,
                  onCompleteHandler
              );
      this.subscriptions.push({ aggregateType, eventType, handlerName: handler.fn.name, subscription });
      return { aggregateType, eventType, handlerName: `${handler.obj.name}.${handler.fn.name}` };
  }

  /**
  * Starts listening to the EventStore
  * Returns observable that resolves to each subscribe agregate/event
  *    emit value: { aggregateType, eventType, handlerName}
  */
  syncState$() {
      return Rx.Observable.from(this.aggregateEventsArray)
          .concatMap(params => this.subscribeEventRetrieval$(params))
  }



  /**
   * Create a subscrition to the event store and returns the subscription info     
   * @param {{aggregateType, eventType, onErrorHandler, onCompleteHandler}} params
   * @return { aggregateType, eventType, handlerName  }
   */
  subscribeEventRetrieval$({ aggregateType, eventType }) {
      const handler = this.functionMap[eventType];
      //MANDATORY:  AVOIDS ACK REGISTRY DUPLICATIONS
      return eventSourcing.eventStore.ensureAcknowledgeRegistry$(aggregateType)
          .switchMap(() => eventSourcing.eventStore.retrieveUnacknowledgedEvents$(aggregateType, BACKEND_KEY))
          .filter(evt => evt.et === eventType)
          .concatMap(evt => Rx.Observable.concat(
              handler.fn.call(handler.obj, evt),
              //MANDATORY:  ACKWOWLEDGE THIS EVENT WAS PROCESSED
              eventSourcing.eventStore.acknowledgeEvent$(evt, BACKEND_KEY)
          ));
  }

  //#endregion
   
}

 

module.exports = () => {
  if (!instance) {
    instance = new EventStoreService();
    console.log("EventStore singleton instance created!");
  }
  return instance;
};

