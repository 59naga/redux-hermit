// dependencies
import { createStore, applyMiddleware } from 'redux';

// self dependencies
import createApp from './createApp';

/**
* @module createAppWithStore
* @param {function} reduxHermit
* @param {function} createSession
* @param {object} [sessionOptions]
* @returns {object} app
*/
export default (reduxHermit, createSession, sessionOptions) => {
  const store = createStore(
    (state = {}, action) => {
      switch (action.type) {
        case 'header':
        case 'container':
        case 'footer':
          return Object.assign({}, state, action.payload);
        default:
          return state;
      }
    },
    applyMiddleware(reduxHermit),
  );

  return createApp(store, createSession, sessionOptions);
};
