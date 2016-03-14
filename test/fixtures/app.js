import express from 'express';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import Container from './Container';

export default (store, createSession) => {
  const app = express();

  app.get('/header', (req, res) => res.end('header'));
  app.get('/container', (req, res) => res.end('container'));
  app.get('/footer', (req, res) => res.end('footer'));
  app.get('/', (req, res) => {
    const container = <Container store={store} />;

    renderToStaticMarkup(container);
    createSession()
    .then(() => {
      res.status(200).send(renderToStaticMarkup(container));
    });
  });

  return app;
};
