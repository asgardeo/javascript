import {jest} from '@jest/globals';

type SpyInstance = ReturnType<typeof jest.spyOn>;

/**
 * Mocks Date constructor to return a specific timestamp
 *
 * @param timestamp - The timestamp value to return from new Date().getTime()
 * @returns Jest spy object for the mocked Date constructor
 *
 * @example
 * ```ts
 * const spy = mockDateNow(1234567890);
 * expect(new Date().getTime()).toBe(1234567890);
 * spy.mockRestore();
 * ```
 */
export const mockDateNow = (timestamp: number): SpyInstance => {
  const spy = jest.spyOn(global, 'Date').mockImplementation(
    () =>
      ({
        getTime: () => timestamp,
      } as any),
  );
  return spy;
};

/**
 * Mocks Math.random() to return a specific value
 *
 * @param value - The value to return from Math.random() (should be between 0 and 1)
 * @returns Jest spy object for the mocked Math.random()
 *
 * @example
 * ```ts
 * const spy = mockMathRandom(0.5);
 * expect(Math.random()).toBe(0.5);
 * spy.mockRestore();
 * ```
 */
export const mockMathRandom = (value: number): SpyInstance => {
  const spy = jest.spyOn(Math, 'random');
  spy.mockReturnValue(value);
  return spy;
};

/**
 * Restores all mocks to their original implementations
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   restoreAllMocks();
 * });
 * ```
 */
export const restoreAllMocks = (): void => {
  jest.restoreAllMocks();
};
