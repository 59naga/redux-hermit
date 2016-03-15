// dependencies
import express from 'express';
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { renderToStaticMarkup } from 'react-dom/server';

// self dependencies
import reducer from './reducer';
import Container from './Container';

/**
* @module createApp
* @param {function} hermit
* @param {object} [options]
* @returns {object} app
*/
export default (hermit, options) => {
  const app = express();

  app.get('/header', (req, res) => res.end('header'));
  app.get('/container', (req, res) => res.end('container'));
  app.get('/footer', (req, res) => res.end('footer'));
  app.get('/', (req, res) => {
    const store = createStore(
      reducer,
      applyMiddleware(hermit),
    );
    const container = <Container store={store} />;

    hermit.session(() => {
      renderToStaticMarkup(container);
    }, options)
    .then(() => {
      store.dispatch({ type: 'SESSION_COMPLETE' });
      res.status(200).send(renderToStaticMarkup(container));
    })
    .catch((error) => {
      res.status(500).send(error.message);
    });
  });

  return app;
};
