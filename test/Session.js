// dependencies
import createAppWithStore from './fixtures/createAppWithStore';
import caravan from 'caravan';
import axios from 'axios';
import immutable from 'immutable';
import assert from 'power-assert';

// target
import hermit, { createSession } from '../src';

// environment
const port = 59798;
process.env.URL = `http://localhost:${port}`;

// specs
describe('Session', () => {
  it('should create a separate session for concurrent requests', (done) => {
    const server = createAppWithStore(hermit, createSession).listen(port, () => {
      const concurrency = 20;
      const urls = immutable.Range(0, concurrency).map(() => process.env.URL).toJS();

      return caravan(urls, { concurrency })
      .then((responses) => {
        const expectedHTML = '<div><div>header</div><div>container</div><div>footer</div></div>';

        assert(responses.length === concurrency);
        responses.forEach((data) => {
          assert(data === expectedHTML);
        });

        server.close(done);
      });
    });
  });

  it('too long the session should reject automatically', (done) => {
    const server = createAppWithStore(hermit, createSession, { timeout: 1 }).listen(port, () => {
      return axios(process.env.URL)
      .catch((response) => {
        assert(response.status === 500);
        assert(response.data === 'timeout of 1ms exceeded');

        server.close(done);
      });
    });
  });
});
