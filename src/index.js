// dependencies
import Promise from 'bluebird';

/**
* create the promiseWatchMiddleware
*
* @returns {function} promiseWatchMiddleware
* @returns {function} promiseWatchMiddleware.wait
*/
export default (middlewareOptions = {}) => {
  const middlewareOpts = Object.assign({
    max: 100,
  }, middlewareOptions);

  const promises = [];// dispatched all promises

  /**
  * capture the promise actions
  *
  * @returns {object} action
  */
  const promiseWatchMiddleware = () => (next) => (action) => {
    if (action && action.then) {
      promises.push(action);
    } else if (action && action.payload && action.payload.then) {
      promises.push(action.payload);
    }

    if (middlewareOpts.max && promises.length > middlewareOpts.max) {
      throw new Error(`captured promises has exceeded the max(${middlewareOpts.max})`);
    }

    return next(action);
  };

  /**
  * wait the all captured promises
  *
  * @param {object} [options]
  * @param {object} [options.timeout=0]
  * @returns {promise<array>} actions
  */
  promiseWatchMiddleware.wait = (options = {}) => {
    const opts = Object.assign({
      timeout: 0,
    }, options);

    return new Promise((resolve, reject) => {
      let id;
      let cancelled;
      if (opts.timeout) {
        id = setTimeout(() => {
          cancelled = true;
          reject(new Error(`timeout of ${opts.timeout}ms exceeded`));
        }, opts.timeout);
      }

      Promise.all(promises).then((actions) => {
        clearTimeout(id);

        if (cancelled) {
          return;
        }
        resolve(actions);
      });
    });
  };

  return promiseWatchMiddleware;
};
