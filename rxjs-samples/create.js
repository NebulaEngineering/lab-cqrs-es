const Rx = require('rxjs');

const source = Rx.Observable.create(observer => {
    observer.next('hola');
    observer.next('mundo');
    observer.complete();
});
    

source
.subscribe(
    (evt) => console.log(evt),
    (err) => console.error(err),
    () => console.log('Completed')
);