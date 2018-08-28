const Rx = require('rxjs');
const scrape = require('website-scraper');


const directory = `/tmp/scrape/${Date.now()}`
const pages = ['http://nodejs.org/', 'https://nodejs.org/api/http.html', 'https://github.com/website-scraper/node-website-scraper', 'https://npmcompare.com/compare/async,axios,got,redux,rxjs'];

Rx.Observable.from(pages)
    .map(page => {
        return {
            urls: [page],
            directory: `${directory}/${page.split('://')[1]}`
        };
    })
    .map(page =>
        Rx.Observable.fromPromise(scrape(page))
            .map(contents => contents[0].url)

    )
    .toArray()
    .mergeMap(obs => Rx.Observable.forkJoin(...obs))
    .subscribe(
        (evt) => console.log(evt),
        (err) => console.error(err),
        () => console.log('Completed')
    );