const Rx = require('rxjs');

Rx.Observable.from([1,2,3,4,5,6,7])
.map(x => x*x)
.subscribe(
    (evt) => console.log(evt),
    (err) => console.error(err),
    () => console.log('Completed')
);