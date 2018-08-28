const Rx = require('rxjs');

const source = 
    Rx.Observable.interval(250)
    .take(40)
    //.do(x => console.log(`source1 - ${x}`));
const bufferControl = Rx.Observable.interval(1010,1000).take(10);

source
.bufferWhen(() => bufferControl)
.subscribe(
    (evt) => console.log(evt),
    (err) => console.error(err),
    () => console.log('Completed')
);