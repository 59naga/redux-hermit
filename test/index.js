// dependencies
import createApp from './fixtures/app';
import { createStore, applyMiddleware } from 'redux';
import axios from 'axios';
import assert from 'power-assert';

// target
import hermit, { createSession } from '../src';

// environment
const port = 59798;
process.env.URL = `http://localhost:${port}`;

// utils
const createAppWithStore = (middleware, waitForRequest) => {
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
    applyMiddleware(middleware),
  );

  return createApp(store, waitForRequest);
};

// specs
describe('', () => {
  let server;
  before((done) => {
    server = createAppWithStore(hermit, createSession).listen(port, done);
  });
  after((done) => {
    server.close(done);
  });

  it('', () => (
    axios(process.env.URL)
    .then((response) => {
      assert(response.data === '<div><div>header</div><div>container</div><div>footer</div></div>');
    })
  ));
});
