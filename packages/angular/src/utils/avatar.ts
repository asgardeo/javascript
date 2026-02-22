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
 * Generates a deterministic gradient background CSS value from a string (e.g. a name).
 * Uses the same algorithm as the React SDK's Avatar component.
 */
export function generateGradient(inputString: string): string {
  const hash: number = inputString.split('').reduce((acc: number, char: string) => {
    const charCode: number = char.charCodeAt(0);
    // eslint-disable-next-line no-bitwise
    return ((acc << 5) - acc + charCode) & 0xffffffff;
  }, 0);
  const seed: number = Math.abs(hash);
  const hue1: number = (seed + seed) % 360;
  const hue2: number = (hue1 + 60 + (seed % 120)) % 360;
  const saturation: number = 70 + (seed % 20);
  const lightness1: number = 55 + (seed % 15);
  const lightness2: number = 60 + ((seed + seed) % 15);
  const angle: number = 45 + (seed % 91);
  return `linear-gradient(${angle}deg, hsl(${hue1}, ${saturation}%, ${lightness1}%), hsl(${hue2}, ${saturation}%, ${lightness2}%))`;
}

/**
 * Extracts initials from a name string (up to 2 characters).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
