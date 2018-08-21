'use strict'

const mongoDB = require('./MongoDB')();
const Rx = require('rxjs');
const CollectionName = "Sample";



class SampleDA {

  /**
   * gets DashBoardDevicesAlarmReport by type
   * @param {string} type
   */
  static getDashBoardDevicesAlarmReport$(evt) {

  }


  static findAll$() {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.find({}).toArray());      
  }



  static createSample$(sample) {
    const collection = mongoDB.db.collection(CollectionName);
    return Rx.Observable.defer(() => collection.insertOne( {...sample, _id:sample.id} ))
      .mapTo(sample);
  }

}

module.exports = SampleDA 