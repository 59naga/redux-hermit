// dependencies
import 'babel-polyfill';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import assert from 'power-assert';

// target
import createPromiseWatchMiddleware from '../src';

// specs
describe('reduxHermit', () => {
  it('no handles', () => {
    const middleware = createPromiseWatchMiddleware();
    const store = createStore((state = {}, action) => {
      return action;
    }, applyMiddleware(middleware));

    store.dispatch({
      type: 'foo',
    });

    const state = store.getState();
    assert(state.type === 'foo');
  });

  it('if action is promise, .wait() returns the promise values', async () => {
    const middleware = createPromiseWatchMiddleware();
    const store = createStore((state = {}, action) => {
      return action;
    }, applyMiddleware(middleware, promiseMiddleware));

    store.dispatch(Promise.resolve({
      type: 'foo',
      payload: 'bar',
    }));

    await middleware.wait().then((values) => {
      assert(values[0].type === 'foo');
      assert(values[0].payload === 'bar');
    });
  });

  it('if action.payload is promise, .wait() returns the **promise** values', async () => {
    const middleware = createPromiseWatchMiddleware();
    const store = createStore((state = {}, action) => {
      return action;
    }, applyMiddleware(middleware, promiseMiddleware));

    store.dispatch({
      type: 'foo',
      payload: Promise.resolve('bar'),
    });

    await middleware.wait().then((values) => {
      assert(values[0] === 'bar');
    });
  });

  it('if promise of more than the specified options.max, throw a exception', async () => {
    const middleware = createPromiseWatchMiddleware({ max: 1 });
    const store = createStore((state = {}, action) => {
      return action;
    }, applyMiddleware(middleware, promiseMiddleware));

    assert.throws(
      () => {
        store.dispatch({
          type: 'foo',
          payload: Promise.resolve('bar'),
        });
        store.dispatch({
          type: 'foo',
          payload: Promise.resolve('bar'),
        });
      },
      (error) => {
        assert(error.message === 'captured promises has exceeded the max(1)');
        return true;
      }
    );
  });

  it('if .wait exceeded options.timeout, promise of .wait to reject', async () => {
    const middleware = createPromiseWatchMiddleware();
    const store = createStore((state = {}, action) => {
      return action;
    }, applyMiddleware(middleware, promiseMiddleware));

    store.dispatch(new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: 'foo',
          payload: 'bar',
        });
      }, 100);
    }));

    let error = {};
    try {
      await middleware.wait({ timeout: 1 });
    } catch (e) {
      error = e;
    } finally {
      assert(error.message === 'timeout of 1ms exceeded');
    }
  });
});
