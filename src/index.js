import Promise from 'bluebird';

let count = 0;
let fulfilled = 0;
let sessionComplete;
const waitFor = (promise, next) => {
  count++;

  return promise.then(
    data => data,
    error => error,
  )
  .then((action) => {
    fulfilled++;

    next(action);
    if (sessionComplete && count === fulfilled) {
      sessionComplete();
    }
  });
};

export function createSession() {
  return new Promise((resolve) => {
    sessionComplete = () => {
      sessionComplete = null;
      resolve();
    };
  });
}

export default () => (next) => (action) => {
  if (action && action.then) {
    return waitFor(action, next);
  }

  if (action && action.payload && action.payload.then) {
    return waitFor(action.payload, next);
  }

  return next(action);
};
