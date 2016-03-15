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

is promise middleware with performing a server-side-rendering after the completion of the promises

Usage
---

```bash
npm install redux-hermit --save
```

if the `action` or `action.payload` is promise, `hermit` from waiting for the promise, and passes the result of promise to the next middleware(or dispatch).

```js
import { createStore, applyMiddleware } from 'redux';
import hermit from 'redux-hermit';
import axios from 'axios';

const loggerMiddleware = () => (next) => (action) => {
  console.log(action.payload.status);
  return next(action);
};
const store = createStore(
  (state = {}, action) => {
    switch (action.type) {
      case 'response':
        return Object.assign({}, state, action.payload);
      default:
        return state;
    }
  },
  applyMiddleware(hermit, loggerMiddleware),
);

async function dispatch() {
  await store.dispatch(
    axios('http://example.com/')
    .then(response => ({
      type: 'response',
      payload: response,
    }))
  );

  console.log(store.getState().statusText);

  await store.dispatch({
    type: 'response',
    payload: axios('http://example.com/'),
  });

  console.log(store.getState().statusText);
}
dispatch();
// 200
// OK
// 200
// OK
```

Server Side Rendering
---

## problem

currently `ReactDOMServer.renderToString` [doesn't wait for the promise](https://github.com/facebook/react/issues/1739).
the following code will fail.

```js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore } from 'redux';
import axios from 'axios';

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
);

const createMock = (name) => (
  class extends React.Component {
    static propTypes = {
      store: React.PropTypes.object.isRequired,
    }

    componentWillMount() {
      axios('http://example.com/')
      .then(() => {
        this.props.store.dispatch({
          type: name,
          payload: {
            [name]: `${name}`,
          },
        });
      });
    }
    render() {
      const value = this.props.store.getState()[name];

      return <div>{value || 'empty'}</div>;
    }
  }
);

const Header = createMock('header');
const Container = createMock('container');
const Footer = createMock('footer');
const Document = (props) => (
  <div>
    <Header {...props} />
    <Container {...props} />
    <Footer {...props} />
  </div>
);

console.log(renderToStaticMarkup(<Document store={store} />));
// <div><div>empty</div><div>empty</div><div>empty</div></div>
```

[inspired by this hack](https://github.com/facebook/react/issues/1739#issuecomment-187328724).
if `session` of the `hermit`,
capture the dispatch have been promise at __componentWillMount__.

```js
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore, applyMiddleware } from 'redux';
import hermit from 'redux-hermit';
import axios from 'axios';

const hermit = createMiddleware();
const store = createStore(
  (state = {}, action) => {
    switch (action.type) {
      case 'SESSION_COMPLETE':
        return Object.assign({}, state, { SESSION_COMPLETE: true });
      case 'header':
      case 'container':
      case 'footer':
        return Object.assign({}, state, action.payload);
      default:
        return state;
    }
  },
  applyMiddleware(hermit),
);

const createMock = (name) => (
  class extends React.Component {
    static propTypes = {
      store: React.PropTypes.object.isRequired,
    }

    componentWillMount() {
      if (this.props.store.getState().SESSION_COMPLETE) {
        return;
      }

      this.props.store.dispatch(
        axios('http://example.com/')
        .then(() => (
          {
            type: name,
            payload: {
              [name]: `${name}`,
            },
          }
        ))
      );
    }
    render() {
      const value = this.props.store.getState()[name];

      return <div>{value || 'empty'}</div>;
    }
  }
);

const Header = createMock('header');
const Container = createMock('container');
const Footer = createMock('footer');
const Document = (props) => (
  <div>
    <Header {...props} />
    <Container {...props} />
    <Footer {...props} />
  </div>
);

hermit.session(() => {
  renderToStaticMarkup(<Document store={store} />);
})
.then(() => {
  store.dispatch({ type: 'SESSION_COMPLETE' });
  console.log(renderToStaticMarkup(<Document store={store} />));
  // <div><div>header</div><div>container</div><div>footer</div></div>
});
```

you can server-side-rendering.

## Attention

* that you must run the __twice__ render.
* that also componentWillMount is performed __twice__(to interrupted by using the `SESSION_COMPLETE` action).

Development
---
Requirement global
* NodeJS v5.7.0
* Npm v3.7.1
* Babel-cli v6.5.1 (babel-core v6.5.2)

```bash
git clone https://github.com/59naga/redux-hermit
cd redux-hermit
npm install

npm test
```

License
---
[MIT](http://59naga.mit-license.org/)
