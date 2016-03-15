// self dependencies
import Session from './session';

/**
* @module reduxHermit
*/
export default () => (next) => (action) => {
  if (action && action.then) {
    return Session.waitFor(action, next);
  }

  if (action && action.payload && action.payload.then) {
    return Session.waitFor(
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
* capture the promises that has been dispatched in target
*
* @module createSession
* @param {function} target - synchronous function for componentWillMount of components
* @param {object} [options]
* @param {object} [options.timeout=2000] - if specify 0, doesn't reject the promise automatically
* @returns {promise} sessionComplete - when the captured promise has been fulfill or reject
*/
export function createSession(target, options = { timeout: 2000 }) {
  Session.current = new Session(options);

  target();

  return Session.current.promise;
}
