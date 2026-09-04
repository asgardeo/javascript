/**
 * Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * Extracts a human-readable message from an error raised by an embedded flow call.
 *
 * Handles:
 * - `AsgardeoAPIError` (and any `Error`) whose message embeds the server's JSON error payload,
 *   e.g. `Authorization request failed: {"code":"ABA-60007","message":"...","description":"..."}`.
 * - Errors that crossed a serialization boundary (such as a Next.js server action) and arrive as a plain
 *   `Error` whose message is the stringified API error:
 *   `[AsgardeoAPIError] (code="...") (HTTP 400 - Bad Request)\nMessage: ...`.
 * - Plain objects carrying `description` / `message` fields, and raw strings.
 *
 * @param error - The caught error.
 * @param fallback - Message to use when nothing meaningful can be extracted.
 * @returns A message suitable for showing to the user.
 */
const resolveFlowErrorMessage = (error: unknown, fallback: string): string => {
  let raw: string = '';

  if (error instanceof Error) {
    raw = error.message;
  } else if (typeof error === 'string') {
    raw = error;
  } else if (error && typeof error === 'object') {
    const {description, message}: {description?: unknown; message?: unknown} = error as Record<string, unknown>;

    raw = (typeof description === 'string' && description) || (typeof message === 'string' && message) || '';
  }

  if (!raw) {
    return fallback;
  }

  // Prefer the description or message of a JSON error payload embedded in the text.
  const jsonStart: number = raw.indexOf('{');
  const jsonEnd: number = raw.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      const payload: {description?: unknown; message?: unknown} = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
      const extracted: unknown = payload?.description || payload?.message;

      if (typeof extracted === 'string' && extracted) {
        return extracted;
      }
    } catch {
      // Not JSON, fall through.
    }
  }

  // Strip the serialized `AsgardeoError` preamble, keeping only what follows `Message:`.
  const messagePart: RegExpMatchArray | null = raw.match(/Message:\s*([\s\S]+)$/);

  if (messagePart?.[1]?.trim()) {
    return messagePart[1].trim();
  }

  return raw;
};

export default resolveFlowErrorMessage;
