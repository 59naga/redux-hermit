// dependencies
import Promise from 'bluebird';

/**
* @class Session
*/
export default class Session {
  /**
  * @constructor
  */
  constructor(options = {}) {
    /**
    * @public
    * @property promise
    */
    this.promise = new Promise((resolve, reject) => {
      /**
      * @private
      * @property _resolve
      */
      this._resolve = resolve;

      /**
      * @private
      * @property _reject
      */
      this._reject = reject;
    });

    /**
    * @public
    * @property pending
    */
    this.pending = 0;

    /**
    * @public
    * @property finally
    */
    this.finally = 0;

    // if exceed the specified `options.timeout`, reject this.promise
    if (options.timeout) {
      setTimeout(() => {
        this.failure(new Error(`timeout of ${options.timeout}ms exceeded`));
      }, options.timeout);
    }
  }

  /**
  * to fulfill the this.promise
  *
  * @public
  * @method success
  * @param {any} value
  */
  success(value) {
    if (this._resolve) {
      this._resolve(value);
      this._resolve = null;
      this._reject = null;
    }
  }

  /**
  * to reject the this.promise
  *
  * @public
  * @method failure
  * @param {Error} reason
  */
  failure(reason) {
    if (this._reject) {
      this._reject(reason);
      this._resolve = null;
      this._reject = null;
    }
  }
}
