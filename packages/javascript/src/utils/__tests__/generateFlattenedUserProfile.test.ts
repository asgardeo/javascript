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

import {describe, it, expect, beforeEach, vi} from 'vitest';
import generateFlattenedUserProfile from '../generateFlattenedUserProfile';

describe('generateFlattenedUserProfile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should extract simple schema-defined fields from top-level response', () => {
    const me = {
      userName: 'john',
      country: 'US',
    };

    const schemas = [{name: 'userName', type: 'STRING', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['userName']).toBe('john');
    expect(out['country']).toBe('US');
  });

  it('should wrap value into array for multiValued schema fields (string -> [string])', () => {
    const me = {emails: 'john@example.com'};
    const schemas = [{name: 'emails', type: 'STRING', multiValued: true}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['emails']).toEqual(['john@example.com']);
  });

  it('should keep array as-is for multiValued schema fields (array stays array)', () => {
    const me = {emails: ['a@x.com', 'b@x.com']};
    const schemas = [{name: 'emails', type: 'STRING', multiValued: true}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['emails']).toEqual(['a@x.com', 'b@x.com']);
  });

  it('should apply default "" for missing non-multiValued STRING fields', () => {
    const me = {};
    const schemas = [{name: 'givenName', type: 'STRING', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out.givenName).toBe('');
  });

  it('should set undefined for missing non-STRING fields', () => {
    const me = {};
    const schemas = [{name: 'age', type: 'NUMBER', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out).toHaveProperty('age', undefined);
  });

  it('should set undefined for missing multiValued fields', () => {
    const me = {};
    const schemas = [{name: 'groups', type: 'STRING', multiValued: true}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out).toHaveProperty('groups', undefined);
  });

  it('should skip parent schema when child schema entries exist (e.g., "name" skipped if "name.givenName" is present)', () => {
    const me = {name: {givenName: 'John', familyName: 'Doe'}};
    const schemas = [
      {name: 'name', type: 'OBJECT', multiValued: false},
      {name: 'name.givenName', type: 'STRING', multiValued: false},
      {name: 'name.familyName', type: 'STRING', multiValued: false},
    ];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out).not.toHaveProperty('name');
    expect(out['name.givenName']).toBe('John');
    expect(out['name.familyName']).toBe('Doe');
  });

  it('should find values inside known SCIM namespaces (direct field)', () => {
    const me = {
      'urn:scim:wso2:schema': {
        country: 'LK',
      },
    };
    const schemas = [{name: 'country', type: 'STRING', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['country']).toBe('LK');
  });

  it('should find values inside known SCIM namespaces (nested path)', () => {
    const me = {
      'urn:ietf:params:scim:schemas:core:2.0:User': {
        name: {givenName: 'Ada'},
      },
    };
    const schemas = [{name: 'name.givenName', type: 'STRING', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['name.givenName']).toBe('Ada');
  });

  it('should include additional fields not in schema and flattens nested objects (unless schema children exist)', () => {
    const me = {
      userName: 'john',
      address: {city: 'Colombo', line1: '1st Street'},
      meta: {created: '2025-01-01'},
    };
    const schemas = [
      {name: 'userName', type: 'STRING', multiValued: false},
      {name: 'address.city', type: 'STRING', multiValued: false},
      {name: 'meta.created', type: 'STRING', multiValued: false},
    ];

    const out = generateFlattenedUserProfile(me, schemas);
    expect(out['userName']).toBe('john');
    expect(out['address.city']).toBe('Colombo');
    expect(out['address.line1']).toBe('1st Street');
    expect(out['meta.created']).toBe('2025-01-01');
  });

  it('should not emit parent extra fields when schema has children for that parent; it flattens instead', () => {
    const me = {
      name: {givenName: 'Grace', familyName: 'Hopper', honorific: 'Rear Admiral'},
    };
    const schemas = [{name: 'name.givenName', type: 'STRING', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['name.givenName']).toBe('Grace');
    expect(out['name.familyName']).toBe('Hopper');
    expect(out['name.honorific']).toBe('Rear Admiral');
    expect(out).not.toHaveProperty('name');
  });

  it('should not overwrite schema-derived values and should keep unknown nested objects as-is', () => {
    const me = {
      userName: 'john',
      nested: {userName: 'should-not-overwrite'},
    };
    const schemas = [{name: 'userName', type: 'STRING', multiValued: false}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['userName']).toBe('john');
    expect(out['nested']).toEqual({userName: 'should-not-overwrite'});
    expect(Object.prototype.hasOwnProperty.call(out, 'nested.userName')).toBe(false);
  });

  it('should handle multiValued schema with primitive extras correctly (keeps extras unchanged if not the same key)', () => {
    const me = {
      tags: 'alpha',
      flags: ['x', 'y'],
    };
    const schemas = [{name: 'tags', type: 'STRING', multiValued: true}];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['tags']).toEqual(['alpha']);
    expect(out['flags']).toEqual(['x', 'y']);
  });

  it('should leave non-schema arrays under extras intact and flattens their parent key directly', () => {
    const me = {groups: [{id: 'g1'}, {id: 'g2'}]};
    const schemas: any[] = [];

    const out = generateFlattenedUserProfile(me, schemas);

    expect(out['groups']).toEqual([{id: 'g1'}, {id: 'g2'}]);
  });
});
