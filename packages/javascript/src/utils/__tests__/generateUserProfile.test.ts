/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

import {describe, it, expect} from 'vitest';
import generateUserProfile from '../generateUserProfile';

describe('generateUserProfile', () => {
  it('should extract simple fields present in the ME response', () => {
    const me = {userName: 'john.doe', country: 'US'};
    const schemas = [
      {name: 'userName', type: 'STRING', multiValued: false},
      {name: 'country', type: 'STRING', multiValued: false},
    ];

    const out = generateUserProfile(me, schemas);

    expect(out['userName']).toBe('john.doe');
    expect(out['country']).toBe('US');
  });

  it('should support dotted paths using get() and sets nested keys using set()', () => {
    const me = {name: {givenName: 'John', familyName: 'Doe'}};
    const schemas = [
      {name: 'name.givenName', type: 'STRING', multiValued: false},
      {name: 'name.familyName', type: 'STRING', multiValued: false},
    ];

    const out = generateUserProfile(me, schemas);

    expect(out['name'].givenName).toBe('John');
    expect(out['name'].familyName).toBe('Doe');
  });

  it('should wrap a single value into an array for multiValued attributes', () => {
    const me = {emails: 'john@example.com'};
    const schemas = [{name: 'emails', type: 'STRING', multiValued: true}];

    const out = generateUserProfile(me, schemas);

    expect(out['emails']).toEqual(['john@example.com']);
  });

  it('should preserve arrays for multiValued attributes', () => {
    const me = {emails: ['a@x.com', 'b@x.com']};
    const schemas = [{name: 'emails', type: 'STRING', multiValued: true}];

    const out = generateUserProfile(me, schemas);

    expect(out['emails']).toEqual(['a@x.com', 'b@x.com']);
  });

  it('should default missing STRING (non-multiValued) to empty string', () => {
    const me = {};
    const schemas = [{name: 'displayName', type: 'STRING', multiValued: false}];

    const out = generateUserProfile(me, schemas);

    expect(out['displayName']).toBe('');
  });

  it('should leave missing non-STRING (non-multiValued) as undefined', () => {
    const me = {};
    const schemas = [
      {name: 'age', type: 'NUMBER', multiValued: false},
      {name: 'isActive', type: 'BOOLEAN', multiValued: false},
    ];

    const out = generateUserProfile(me, schemas);

    expect(out).toHaveProperty('age');
    expect(out['age']).toBeUndefined();
    expect(out).toHaveProperty('isActive');
    expect(out['isActive']).toBeUndefined();
  });

  it('should leave missing multiValued attributes as undefined', () => {
    const me = {};
    const schemas = [{name: 'groups', type: 'STRING', multiValued: true}];

    const out = generateUserProfile(me, schemas);

    expect(out).toHaveProperty('groups');
    expect(out['groups']).toBeUndefined();
  });

  it('should ignore schema entries without a name', () => {
    const me = {userName: 'john'};
    const schemas = [
      {name: 'userName', type: 'STRING', multiValued: false},
      {type: 'STRING', multiValued: false},
    ];

    const out = generateUserProfile(me, schemas);

    expect(out['userName']).toBe('john');
    expect(Object.keys(out).sort()).toEqual(['userName']);
  });

  it('should not mutate the source ME response', () => {
    const me = {userName: 'john', emails: 'a@x.com'};
    const snapshot = JSON.parse(JSON.stringify(me));
    const schemas = [
      {name: 'userName', type: 'STRING', multiValued: false},
      {name: 'emails', type: 'STRING', multiValued: true},
      {name: 'missingStr', type: 'STRING', multiValued: false},
    ];

    const _out = generateUserProfile(me, schemas);

    expect(me).toEqual(snapshot);
  });

  it('should preserve explicit null values (only undefined triggers defaults)', () => {
    const me = {nickname: null};
    const schemas = [{name: 'nickname', type: 'STRING', multiValued: false}];

    const out = generateUserProfile(me, schemas);

    expect(out['nickname']).toBeNull();
  });

  it('should handle mixed present/missing values in one pass', () => {
    const me = {
      userName: 'john',
      emails: ['a@x.com'],
      name: {givenName: 'John'},
    };
    const schemas = [
      {name: 'userName', type: 'STRING', multiValued: false},
      {name: 'emails', type: 'STRING', multiValued: true},
      {name: 'name.givenName', type: 'STRING', multiValued: false},
      {name: 'name.middleName', type: 'STRING', multiValued: false},
      {name: 'age', type: 'NUMBER', multiValued: false},
      {name: 'groups', type: 'STRING', multiValued: true},
    ];

    const out = generateUserProfile(me, schemas);

    expect(out['userName']).toBe('john');
    expect(out['emails']).toEqual(['a@x.com']);
    expect(out?.['name']?.givenName).toBe('John');
    expect(out?.['name']?.middleName).toBe('');
    expect(out['age']).toBeUndefined();
    expect(out['groups']).toBeUndefined();
  });
});
