// dependencies
import Promise from 'bluebird';

/**
* @class Session
*/
export default class Session {
  /**
  * @static
  * @public
  * @property current
  */
  static current = null;

  /**
  * if the session has been created just before dispatch
  * the session(currentSession) will capture the action.
  *
  * @static
  * @public
  * @method waitFor
  * @param {promise<object>|object} promise
  * @param {function} resolved - fulfilled callback
  * @param {function} [rejected] - rejected callback
  * @returns {promise<undefined>} pendingPromise
  */
  static waitFor(promise, resolved, rejected) {
    const currentSession = Session.current;
    if (currentSession) {
      currentSession.pending++;
    }

    return promise.then(
      value => resolved(value),
      rejected ? error => rejected(error) : undefined,
    )
    .then(() => {
      if (currentSession) {
        currentSession.finally++;

        if (currentSession.pending === currentSession.finally) {
          currentSession.complete();
        }
      }
    });
  }

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
  * @method complete
  * @param {any} value
  */
  complete(value) {
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
