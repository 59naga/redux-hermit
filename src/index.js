// self dependencies
import Session from './Session';

/**
* @module createMiddleware
*/
export function createMiddleware() {
  const middleware = () => (next) => (action) => {
    if (action && action.then) {
      return middleware.waitFor(action, next);
    }

    if (action && action.payload && action.payload.then) {
      return middleware.waitFor(
        action.payload,
        (payload) => {
          next({ ...action, payload });
        },
        (payload) => {
          next({ ...action, payload, error: true });
        },
      );
    }

    return next(action);
  };

  /**
  * @private
  * @property _session
  */
  let _session = null;

  /**
  * capture the promises that has been dispatched in target
  *
  * @module session
  * @param {function} target - synchronous function for componentWillMount of components
  * @param {object} [options]
  * @param {object} [options.timeout=2000] - if specify 0, doesn't reject the promise automatically
  * @returns {promise} sessionComplete - when the captured promise has been fulfill or reject
  */
  middleware.session = (target, options = { timeout: 2000 }) => {
    _session = new Session(options);

    target();

    return _session.promise;
  };

  /**
  * if the session has been created just before dispatch
  * the session(currentSession) will capture the action.
  *
  * @public
  * @method waitFor
  * @param {promise<object>|object} promise
  * @param {function} resolved - fulfilled callback
  * @param {function} [rejected] - rejected callback
  * @returns {promise<undefined>} pendingPromise
  */
  middleware.waitFor = (promise, resolved, rejected) => {
    const currentSession = _session;
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
          currentSession.success();
        }
      }
    });
  };

  return middleware;
}

/**
* @var hermit
*/
export default createMiddleware();
