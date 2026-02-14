/**
 * Shared HTTP utilities for e2e setup scripts.
 */

import {Agent} from 'undici';

export const insecureAgent = new Agent({
  connect: {rejectUnauthorized: false},
});

export function basicAuth(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}
