import generateSessionId from '../../utils/generateSessionId';
import {mockDateNow, mockMathRandom, restoreAllMocks} from '../helpers/mockHelpers';

/**
 * Test suite for generateSessionId utility function
 * Tests the generation of unique session identifiers
 */
describe('generateSessionId', () => {
  afterEach(() => {
    restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should return a string', () => {
      const sessionId = generateSessionId();

      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });
  });

  describe('uniqueness', () => {
    it('should generate unique IDs on multiple calls', () => {
      const ids = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        ids.add(generateSessionId());
      }

      expect(ids.size).toBe(iterations);
    });

    it('should generate different IDs in rapid succession', () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      const id3 = generateSessionId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });
  });

  describe('format and composition', () => {
    it('should contain timestamp component', () => {
      const mockTimestamp = 1234567890000;
      const expectedTimestampPart = mockTimestamp.toString(36);
      mockDateNow(mockTimestamp);
      mockMathRandom(0.5);

      const sessionId = generateSessionId();

      expect(sessionId).toContain(expectedTimestampPart);
    });

    it('should contain random component', () => {
      const mockRandomValue = 0.123456789;
      const expectedRandomPart = mockRandomValue.toString(36).substring(2);
      mockDateNow(1000000);
      mockMathRandom(mockRandomValue);

      const sessionId = generateSessionId();

      expect(sessionId).toContain(expectedRandomPart);
    });

    it('should combine timestamp and random components', () => {
      const mockTimestamp = 1609459200000;
      const mockRandomValue = 0.987654321;
      const expectedTimestampPart = mockTimestamp.toString(36);
      const expectedRandomPart = mockRandomValue.toString(36).substring(2);
      mockDateNow(mockTimestamp);
      mockMathRandom(mockRandomValue);

      const sessionId = generateSessionId();

      expect(sessionId).toBe(expectedTimestampPart + expectedRandomPart);
    });
  });
});
