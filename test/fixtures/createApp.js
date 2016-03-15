// dependencies
import express from 'express';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// self dependencies
import Container from './Container';

/**
* @module createApp
* @param {object} store
* @param {function} createSession
* @param {object} [sessionOptions]
* @returns {object} app
*/
export default (store, createSession, sessionOptions) => {
  const app = express();

  app.get('/header', (req, res) => res.end('header'));
  app.get('/container', (req, res) => res.end('container'));
  app.get('/footer', (req, res) => res.end('footer'));
  app.get('/', (req, res) => {
    const container = <Container store={store} />;

    createSession(() => {
      renderToStaticMarkup(container);
    }, sessionOptions)
    .then(() => {
      res.status(200).send(renderToStaticMarkup(container));
    })
    .catch((error) => {
      res.status(500).send(error.message);
    });
  });

  return app;
};
