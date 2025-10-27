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

import {describe, expect, it} from 'vitest';
import deepMerge from '../deepMerge';

describe('deepMerge', (): void => {
  it('should merge simple objects', (): void => {
    const target = {a: 1, b: 2};
    const source = {b: 3, c: 4};
    const result = deepMerge(target, source as any);

    expect(result).toEqual({a: 1, b: 3, c: 4});
    expect(result).not.toBe(target); // Should create a new object
  });

  it('should merge nested objects recursively', (): void => {
    const target = {
      a: 1,
      b: {
        x: 1,
        y: 2,
      },
    };
    const source = {
      b: {
        y: 3,
        z: 4,
      },
      c: 3,
    };
    const result = deepMerge(target, source as any);

    expect(result).toEqual({
      a: 1,
      b: {x: 1, y: 3, z: 4},
      c: 3,
    });
  });

  it('should handle deeply nested objects', (): void => {
    const target = {
      theme: {
        colors: {
          primary: 'blue',
          secondary: 'green',
        },
        spacing: {
          small: 8,
        },
      },
    };
    const source = {
      theme: {
        colors: {
          secondary: 'red',
          accent: 'yellow',
        },
        typography: {
          fontSize: 16,
        },
      },
    };
    const result = deepMerge(target, source as any);

    expect(result).toEqual({
      theme: {
        colors: {
          primary: 'blue',
          secondary: 'red',
          accent: 'yellow',
        },
        spacing: {
          small: 8,
        },
        typography: {
          fontSize: 16,
        },
      },
    });
  });

  it('should replace arrays entirely instead of merging', (): void => {
    const target = {arr: [1, 2, 3]};
    const source = {arr: [4, 5]};
    const result = deepMerge(target, source);

    expect(result).toEqual({arr: [4, 5]});
  });

  it('should handle multiple sources', (): void => {
    const target = {a: 1, b: {x: 1}};
    const source1 = {b: {y: 2}, c: 3};
    const source2 = {b: {z: 3}, d: 4};
    const result = deepMerge(target, source1 as any, source2 as any);

    expect(result).toEqual({
      a: 1,
      b: {x: 1, y: 2, z: 3},
      c: 3,
      d: 4,
    });
  });

  it('should handle undefined and null sources', (): void => {
    const target = {a: 1, b: 2};
    const result = deepMerge(target, undefined, null as any, {c: 3} as any);

    expect(result).toEqual({a: 1, b: 2, c: 3});
  });

  it('should handle empty objects', (): void => {
    const target = {};
    const source = {a: 1, b: {x: 2}};
    const result = deepMerge(target, source);

    expect(result).toEqual({a: 1, b: {x: 2}});
  });

  it('should not modify the original objects', (): void => {
    const target = {a: 1, b: {x: 1}};
    const source = {b: {y: 2}, c: 3};
    const originalTarget = JSON.parse(JSON.stringify(target));
    const originalSource = JSON.parse(JSON.stringify(source));

    deepMerge(target, source as any);

    expect(target).toEqual(originalTarget);
    expect(source).toEqual(originalSource);
  });

  it('should handle special object types correctly', (): void => {
    const date = new Date('2023-01-01');
    const regex = /test/g;
    const target = {a: 1};
    const source = {
      date: date,
      regex: regex,
      func: () => 'test',
    };
    const result = deepMerge(target, source as any);

    expect((result as any).date).toBe(date);
    expect((result as any).regex).toBe(regex);
    expect(typeof (result as any).func).toBe('function');
  });

  it('should handle nested special objects', (): void => {
    const target = {
      config: {
        timeout: 1000,
      },
    };
    const source = {
      config: {
        date: new Date('2023-01-01'),
        patterns: [/test/g, /example/i],
      },
    };
    const result = deepMerge(target, source as any);

    expect((result as any).config.timeout).toBe(1000);
    expect((result as any).config.date).toBeInstanceOf(Date);
    expect(Array.isArray((result as any).config.patterns)).toBe(true);
  });

  it('should handle boolean and number values', (): void => {
    const target = {enabled: true, count: 5};
    const source = {enabled: false, count: 10, active: true};
    const result = deepMerge(target, source);

    expect(result).toEqual({enabled: false, count: 10, active: true});
  });

  it('should handle string values', (): void => {
    const target = {name: 'John', nested: {title: 'Mr.'}};
    const source = {name: 'Jane', nested: {title: 'Ms.', surname: 'Doe'}};
    const result = deepMerge(target, source);

    expect(result).toEqual({
      name: 'Jane',
      nested: {title: 'Ms.', surname: 'Doe'},
    });
  });

  it('should throw error for non-object target', (): void => {
    expect(() => deepMerge(null as any)).toThrow('Target must be an object');
    expect(() => deepMerge(undefined as any)).toThrow('Target must be an object');
    expect(() => deepMerge('string' as any)).toThrow('Target must be an object');
    expect(() => deepMerge(123 as any)).toThrow('Target must be an object');
  });

  it('should handle complex real-world scenario', (): void => {
    const defaultConfig = {
      api: {
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        retries: 3,
      },
      ui: {
        theme: {
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
          },
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
          },
        },
        components: {
          button: {
            borderRadius: 4,
          },
        },
      },
      features: {
        analytics: true,
        debug: false,
      },
    };

    const userConfig = {
      api: {
        baseUrl: 'https://custom-api.example.com',
        headers: {
          'X-Custom': 'value',
        },
      },
      ui: {
        theme: {
          colors: {
            primary: '#ff0000',
          },
          spacing: {
            lg: 32,
          },
        },
        components: {
          input: {
            borderWidth: 2,
          },
        },
      },
      features: {
        debug: true,
        experimental: true,
      },
    };

    const result = deepMerge(defaultConfig, userConfig as any);

    expect(result).toEqual({
      api: {
        baseUrl: 'https://custom-api.example.com',
        timeout: 5000,
        retries: 3,
        headers: {
          'X-Custom': 'value',
        },
      },
      ui: {
        theme: {
          colors: {
            primary: '#ff0000',
            secondary: '#6c757d',
          },
          spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 32,
          },
        },
        components: {
          button: {
            borderRadius: 4,
          },
          input: {
            borderWidth: 2,
          },
        },
      },
      features: {
        analytics: true,
        debug: true,
        experimental: true,
      },
    });
  });

  it('should not overwrite with undefined from source', () => {
    const target = {a: 1, b: 2};
    const source = {a: undefined, b: undefined};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: 1, b: 2});
  });

  it('should overwrite with null from source', () => {
    const target = {a: 1, b: {x: 1}};
    const source = {a: null, b: null};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: null, b: null});
  });

  it('should not mutate original nested objects', () => {
    const target = {a: {x: 1}, b: {y: 2}};
    const source = {a: {z: 3}};
    const result = deepMerge(target, source);
    // mutate originals
    target.a.x = 999;
    (source.a as any).z = 777;
    expect(result).toEqual({a: {x: 1, z: 3}, b: {y: 2}});
  });

  it('should handle multiple sources with nested merges', () => {
    const target = {cfg: {mode: 'a', depth: 1}, k: 1};
    const s1 = {cfg: {mode: 'b'}, k: 2};
    const s2 = {cfg: {mode: 'c', extra: true}, k: 3};
    const result = deepMerge(target, s1, s2);
    expect(result).toEqual({cfg: {mode: 'c', depth: 1, extra: true}, k: 3});
  });

  it('should replace non-plain with plain (and vice versa) instead of merging', () => {
    const d = new Date('2024-01-01');
    const target = {a: d, b: {x: 1}, c: /re/g, f: () => 1};
    const source = {a: {y: 2}, b: new Date('2024-02-02'), c: {z: 3}, f: {k: 1}};
    const result = deepMerge(target, source as any);
    // a: Date -> plain object (replace)
    expect(result.a).toEqual({y: 2});
    // b: plain -> Date (replace)
    expect(result.b).toBeInstanceOf(Date);
    // c: RegExp -> plain object (replace)
    expect(result.c).toEqual({z: 3});
    // f: function -> plain object (replace)
    expect((result as any).f).toEqual({k: 1});
  });

  it('should replace nested arrays instead of merging them', () => {
    const target = {cfg: {list: [1, 2, 3], other: 1}};
    const source = {cfg: {list: ['a']}};
    const result = deepMerge(target, source);
    expect(result).toEqual({cfg: {list: ['a'], other: 1}});
  });

  it('should not add keys for undefined-only sources', () => {
    const target = {a: 1};
    const source = {b: undefined};
    const result = deepMerge(target, source);
    expect(result).toEqual({a: 1});
    expect('b' in result).toBe(false);
  });
});
