Redux Hermit
---

<p align="right">
  <a href="https://npmjs.org/package/redux-hermit">
    <img src="https://img.shields.io/npm/v/redux-hermit.svg?style=flat-square">
  </a>
  <a href="https://travis-ci.org/59naga/redux-hermit">
    <img src="http://img.shields.io/travis/59naga/redux-hermit.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/redux-hermit/coverage">
    <img src="https://img.shields.io/codeclimate/github/59naga/redux-hermit.svg?style=flat-square">
  </a>
  <a href="https://codeclimate.com/github/59naga/redux-hermit">
    <img src="https://img.shields.io/codeclimate/coverage/github/59naga/redux-hermit.svg?style=flat-square">
  </a>
  <a href="https://gemnasium.com/59naga/redux-hermit">
    <img src="https://img.shields.io/gemnasium/59naga/redux-hermit.svg?style=flat-square">
  </a>
</p>

is watch the dispatched promise actions for server-side-rending.

Installation
---
```bash
npm install redux-hermit --save
```

Problem
---
currently `ReactDOMServer.renderToString` [doesn't wait for the promise](https://github.com/facebook/react/issues/1739).
the following code will fail.

```js
// Foo.jsx
import React from 'react';
import { connect } from 'react-redux';

export default connect(
  state => state,
)(
  class extends React.Component {
    componentWillMount() {
      if (this.props.alreadyInitialized) {
        return;
      }
      // any asynchronous processing...
      console.log('mount props:', this.props);
      this.props.dispatch(new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            type: 'update',
            payload: {
              foo: 'complete',
            },
          });
        }, Math.random() * 500);
      }));
    }
    render() {
      return (
        <div>
          {this.props.foo || 'loading...'}
          {this.props.children}
        </div>
      );
    }
  }
);
```

```js
// index.jsx
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import { Provider } from 'react-redux';
import Foo from './Foo';

const store = createStore(
  (state = {}, action) => {
    if (action.type === 'alreadyInitialized') {
      return Object.assign({}, state, { alreadyInitialized: true });
    }
    if (action.type === 'update') {
      return Object.assign({}, state, action.payload);
    }
    return state;
  },
  applyMiddleware(
    promiseMiddleware,
  ),
);

const provider = (
  <Provider store={store}>
    <Foo />
  </Provider>
);

console.log('state:', store.getState())
console.log(renderToStaticMarkup(provider));
```

```bash
babel-node index.jsx
# state: {}
# mount props: { dispatch: [Function] }
# <div>loading...</div>
```

[inspired by this hack](https://github.com/facebook/react/issues/1739#issuecomment-187328724).

`promiseWatchMiddleware.wait` is wait the fulfill of captured promise actions at __componentWillMount__.

```js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import createPromiseWatchMiddleware from 'redux-hermit';
import { Provider } from 'react-redux';
import Foo from './Foo';

const promiseWatchMiddleware = createPromiseWatchMiddleware();
const store = createStore(
  (state = {}, action) => {
    if (action.type === 'alreadyInitialized') {
      return Object.assign({}, state, { alreadyInitialized: true });
    }
    if (action.type === 'update') {
      return Object.assign({}, state, action.payload);
    }
    return state;
  },
  applyMiddleware(
    promiseWatchMiddleware,
    promiseMiddleware,
  ),
);

const provider = (
  <Provider store={store}>
    <Foo />
  </Provider>
);

renderToStaticMarkup(provider);

promiseWatchMiddleware.wait().then(() => {
  store.dispatch({ type: 'alreadyInitialized' });

  console.log('state:', store.getState());
  console.log(renderToStaticMarkup(provider));
});
```

you can server-side-rendering.

```bash
babel-node index.jsx
# state: { foo: 'complete' }
# <div>complete</div>
```

## Attention

* that you must run the __twice__ render.
* that also `componentWillMount` is performed __twice__(can interrupted by using the `alreadyInitialized`).

Development
---
Requirement global
* NodeJS v5.7.0
* Npm v3.7.1

```bash
git clone https://github.com/59naga/redux-hermit
cd redux-hermit
npm install

npm test
```

License
---
[MIT](http://59naga.mit-license.org/)
