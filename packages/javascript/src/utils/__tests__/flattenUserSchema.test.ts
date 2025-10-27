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
import flattenUserSchema from '../flattenUserSchema';
import type {Schema, SchemaAttribute, FlattenedSchema} from '../../models/scim2-schema';

const baseAttr = (overrides: Partial<SchemaAttribute> = {}): SchemaAttribute => ({
  name: 'attr',
  type: 'string',
  multiValued: false,
  caseExact: false,
  mutability: 'readWrite',
  returned: 'default',
  uniqueness: 'none',
  ...overrides,
});

const baseSchema = (overrides: Partial<Schema> = {}): Schema => ({
  id: 'urn:ietf:params:scim:schemas:core:2.0:User',
  name: 'User',
  description: 'User schema',
  attributes: [],
  ...overrides,
});

describe('flattenUserSchema', () => {
  it('should return empty array when input is empty', () => {
    expect(flattenUserSchema([])).toEqual([]);
  });

  it('should ignore schemas with missing/undefined attributes', () => {
    const schema: Schema = baseSchema({attributes: undefined as any});
    expect(flattenUserSchema([schema])).toEqual([]);
  });

  it('should flatten simple (non-complex) top-level attributes directly', () => {
    const schema = baseSchema({
      attributes: [baseAttr({name: 'userName'}), baseAttr({name: 'active', type: 'boolean'})],
    });

    const out = flattenUserSchema([schema]);

    expect(out).toEqual([
      expect.objectContaining({name: 'userName', schemaId: schema.id}),
      expect.objectContaining({name: 'active', schemaId: schema.id}),
    ]);
    // Ensure other props are preserved
    expect(out[0]).toMatchObject({type: 'string', multiValued: false});
    expect(out[1]).toMatchObject({type: 'boolean', multiValued: false});
  });

  it('should flatten complex attributes into dot-notation (includes only sub-attributes, not the parent)', () => {
    const schema = baseSchema({
      attributes: [
        baseAttr({
          name: 'name',
          type: 'complex',
          subAttributes: [baseAttr({name: 'givenName'}), baseAttr({name: 'familyName'})],
        }),
      ],
    });

    const out = flattenUserSchema([schema]);
    expect(out).toEqual([
      expect.objectContaining({name: 'name.givenName', schemaId: schema.id}),
      expect.objectContaining({name: 'name.familyName', schemaId: schema.id}),
    ]);

    const names = out.map(a => a.name);
    expect(names).not.toContain('name');
  });

  it('should drop complex attributes with an empty subAttributes array (no parent emitted)', () => {
    const schema = baseSchema({
      attributes: [
        baseAttr({
          name: 'address',
          type: 'complex',
          subAttributes: [], // empty — nothing should be emitted
        }),
      ],
    });

    expect(flattenUserSchema([schema])).toEqual([]);
  });

  it('should handle deeper nesting by only including leaf sub-attributes (one level processed)', () => {
    const schema = baseSchema({
      attributes: [
        baseAttr({
          name: 'profile',
          type: 'complex',
          subAttributes: [
            baseAttr({
              name: 'contact',
              type: 'complex',
              subAttributes: [baseAttr({name: 'email'}), baseAttr({name: 'phone', type: 'string'})],
            }),
            baseAttr({name: 'nickname'}),
          ],
        }),
      ],
    });

    const out = flattenUserSchema([schema]);
    expect(out.map(a => a.name)).toEqual(['profile.contact', 'profile.nickname']);
    out.forEach(a => expect(a.schemaId).toBe(schema.id));
  });

  it('should support multiple schemas and tags each flattened attribute with the correct schemaId', () => {
    const userSchema = baseSchema({
      id: 'urn:user',
      attributes: [
        baseAttr({name: 'userName'}),
        baseAttr({
          name: 'name',
          type: 'complex',
          subAttributes: [baseAttr({name: 'givenName'})],
        }),
      ],
    });

    const groupSchema = baseSchema({
      id: 'urn:group',
      name: 'Group',
      description: 'Group schema',
      attributes: [
        baseAttr({name: 'displayName'}),
        baseAttr({
          name: 'owner',
          type: 'complex',
          subAttributes: [baseAttr({name: 'value'})],
        }),
      ],
    });

    const out = flattenUserSchema([userSchema, groupSchema]);

    expect(out).toEqual([
      expect.objectContaining({name: 'userName', schemaId: 'urn:user'}),
      expect.objectContaining({name: 'name.givenName', schemaId: 'urn:user'}),
      expect.objectContaining({name: 'displayName', schemaId: 'urn:group'}),
      expect.objectContaining({name: 'owner.value', schemaId: 'urn:group'}),
    ]);
  });
});
