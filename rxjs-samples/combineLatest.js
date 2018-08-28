const Rx = require('rxjs');

const source1 = Rx.Observable.interval(1000).take(10);
const source2 = Rx.Observable.interval(3000).take(5);

Rx.Observable.combineLatest(source1,source2)
.subscribe(
    (evt) => console.log(evt),
    (err) => console.error(err),
    () => console.log('Completed')
);