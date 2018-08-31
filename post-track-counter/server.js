'use strict'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const eventSourcing = require('./lib/tools/EventSourcing')();
const eventStoreService = require('./lib/service/EventStoreService')();
const mongoDB = require('./lib/data/MongoDB')();
const GraphQL = require('./lib/service/GraphQL');
const Rx = require('rxjs');
const nineGagListenerDomain = require('./lib/domain/PostCounterDomain')();


const start = () => {
    Rx.Observable.concat(
        eventSourcing.eventStore.start$(),
        eventStoreService.start$(),
        mongoDB.start$(),

        // Syncs event-store state
        eventStoreService.syncState$(),
        GraphQL.start$(),
        nineGagListenerDomain.start$()
    ).subscribe(
        (evt) => {
            console.log(evt);
        },
        (error) => {
            console.error('Failed to start', error);
            process.exit(1);
        },
        () => console.log('Template started')
    );
};

start();