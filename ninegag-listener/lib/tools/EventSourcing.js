'use strict'

const Rx = require('rxjs');
const nebulaeES = require('@nebulae/event-store');
const Event = nebulaeES.Event;
const EventStore = nebulaeES.EventStore;

let instance;

class EventSourcing {

    constructor() {
        this.eventStore = new EventStore(
            {
                type: process.env.EVENT_STORE_BROKER_TYPE,
                eventsTopic: process.env.EVENT_STORE_BROKER_EVENTS_TOPIC,
                eventsTopicSubscription: `${process.env.EVENT_STORE_BROKER_EVENTS_TOPIC}_dashboard-devices`,
                brokerUrl: process.env.EVENT_STORE_BROKER_URL,
                projectId: process.env.EVENT_STORE_BROKER_PROJECT_ID,
            },
            {
                type: process.env.EVENT_STORE_STORE_TYPE,
                url: process.env.EVENT_STORE_STORE_URL,
                eventStoreDbName: process.env.EVENT_STORE_STORE_EVENTSTORE_DB_NAME,
                aggregatesDbName: process.env.EVENT_STORE_STORE_AGGREGATES_DB_NAME
            }
        );
    }
    
}

module.exports = () => {
    if (!instance) {
        instance = new EventSourcing();
        console.log('EventSourcing Singleton created');
    }
    return instance;
};