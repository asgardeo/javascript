/**
 * Custom Gate runtime config for e2e tests.
 *
 * Points the Gate's API calls at the Docker Thunder container
 * on port 9090 (mapped from 8090 to avoid conflicts with any
 * local Thunder dev server).
 */

/* eslint-disable no-underscore-dangle */

window.__THUNDER_RUNTIME_CONFIG__ = {
  client: {
    base: '/gate',
  },
  server: {
    public_url: 'https://localhost:9090',
  },
};
