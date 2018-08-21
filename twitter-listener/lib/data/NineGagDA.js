'use strict'

const Rx = require('rxjs');
const client = require('9gag');
const Scraper = client.Scraper;

let instance = null;

class NineGag {

    retrieve$(track, lastPostId){
        const scraper = new Scraper(10, track, 3);
        return Rx.Observable.fromPromise(scraper.scrap(lastPostId))
        .mergeMap(posts => Rx.Observable.from(posts));
    }

}

module.exports = () => {
    if (!instance) {
        instance = new NineGag();
        console.log(`9Gag instance created`);
    }
    return instance;
};