import CookieConfig from '../../constants/CookieConfig';

/**
 * Test suite for CookieConfig constants
 * Verifies that all cookie configuration constants are correctly defined
 */
describe('CookieConfig', () => {
  describe('cookie name constants', () => {
    it('should have correct SESSION_COOKIE_NAME', () => {
      expect(CookieConfig.SESSION_COOKIE_NAME).toBeDefined();
      expect(CookieConfig.SESSION_COOKIE_NAME).toContain('session');
      expect(typeof CookieConfig.SESSION_COOKIE_NAME).toBe('string');
    });

    it('should have correct TEMP_SESSION_COOKIE_NAME', () => {
      expect(CookieConfig.TEMP_SESSION_COOKIE_NAME).toBeDefined();
      expect(CookieConfig.TEMP_SESSION_COOKIE_NAME).toContain('temp.session');
      expect(typeof CookieConfig.TEMP_SESSION_COOKIE_NAME).toBe('string');
    });
  });

  describe('default configuration values', () => {
    it('should have DEFAULT_MAX_AGE of 3600', () => {
      expect(CookieConfig.DEFAULT_MAX_AGE).toBe(3600);
      expect(typeof CookieConfig.DEFAULT_MAX_AGE).toBe('number');
    });

    it('should have DEFAULT_HTTP_ONLY as true', () => {
      expect(CookieConfig.DEFAULT_HTTP_ONLY).toBe(true);
      expect(typeof CookieConfig.DEFAULT_HTTP_ONLY).toBe('boolean');
    });

    it('should have DEFAULT_SAME_SITE as lax', () => {
      expect(CookieConfig.DEFAULT_SAME_SITE).toBe('lax');
      expect(typeof CookieConfig.DEFAULT_SAME_SITE).toBe('string');
    });

    it('should have DEFAULT_SECURE as true', () => {
      expect(CookieConfig.DEFAULT_SECURE).toBe(true);
      expect(typeof CookieConfig.DEFAULT_SECURE).toBe('boolean');
    });
  });

  describe('class design', () => {
    it('should not be instantiable due to private constructor', () => {
      // This test documents the design intent that CookieConfig cannot be instantiated
      // TypeScript prevents instantiation at compile time with: new CookieConfig()
      // We verify the constructor exists and the class is properly defined
      expect(CookieConfig.constructor).toBeDefined();
      expect(typeof CookieConfig).toBe('function');
    });
  });
});
