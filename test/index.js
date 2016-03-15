// dependencies
import 'babel-polyfill';
import { createStore, applyMiddleware } from 'redux';
import assert from 'power-assert';

// target
import reduxHermit from '../src';

// specs
describe('reduxHermit', () => {
  let store;
  before(() => {
    store = createStore((state = {}, action) => {
      return action;
    }, applyMiddleware(reduxHermit));
  });

  it('handles Flux standard actions', async () => {
    let state;
    await store.dispatch({
      type: 'foo',
      payload: Promise.resolve('bar'),
    });

    state = store.getState();
    assert(state.type === 'foo');
    assert(state.payload === 'bar');

    await store.dispatch({
      type: 'foo',
      payload: Promise.reject(new Error('bar')),
    });

    state = store.getState();
    assert(state.type === 'foo');
    assert(state.payload.message === 'bar');
    assert(state.error);
  });

  it('handles promises', async () => {
    await store.dispatch(Promise.resolve({
      type: 'foo',
      payload: 'bar',
    }));

    const state = store.getState();
    assert(state.type === 'foo');
    assert(state.payload === 'bar');

    await store.dispatch(Promise.reject(new Error('bar')))
    .catch((error) => {
      assert(error.message === 'bar');
    });
  });

  it('ignores non-promises', () => {
    try {
      store.dispatch('foo');
    } catch (error) {
      assert(error.message.match('Actions must be plain objects'));
    }

    store.dispatch({
      type: 'foo',
      payload: 'bar',
    });
    const state = store.getState();
    assert(state.type === 'foo');
    assert(state.payload === 'bar');
  });
});
