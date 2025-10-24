import getSessionCookieOptions from '../../utils/getSessionCookieOptions';
import CookieConfig from '../../constants/CookieConfig';

/**
 * Test suite for getSessionCookieOptions utility function
 * Tests the merging of cookie options with defaults
 */
describe('getSessionCookieOptions', () => {
  describe('default behavior', () => {
    it('should return all default values when given empty options', () => {
      const input = {};

      const result = getSessionCookieOptions(input);

      expect(result).toEqual({
        httpOnly: CookieConfig.DEFAULT_HTTP_ONLY,
        maxAge: CookieConfig.DEFAULT_MAX_AGE,
        sameSite: CookieConfig.DEFAULT_SAME_SITE,
        secure: CookieConfig.DEFAULT_SECURE,
      });
    });
  });

  describe('partial options', () => {
    it('should merge provided maxAge with defaults', () => {
      const input = {maxAge: 7200};

      const result = getSessionCookieOptions(input);

      expect(result.maxAge).toBe(7200);
      expect(result.httpOnly).toBe(CookieConfig.DEFAULT_HTTP_ONLY);
      expect(result.sameSite).toBe(CookieConfig.DEFAULT_SAME_SITE);
      expect(result.secure).toBe(CookieConfig.DEFAULT_SECURE);
    });

    it('should merge provided secure with defaults', () => {
      const input = {secure: false};

      const result = getSessionCookieOptions(input);

      expect(result.secure).toBe(false);
      expect(result.httpOnly).toBe(CookieConfig.DEFAULT_HTTP_ONLY);
      expect(result.maxAge).toBe(CookieConfig.DEFAULT_MAX_AGE);
      expect(result.sameSite).toBe(CookieConfig.DEFAULT_SAME_SITE);
    });

    it('should merge provided httpOnly with defaults', () => {
      const input = {httpOnly: false};

      const result = getSessionCookieOptions(input);

      expect(result.httpOnly).toBe(false);
      expect(result.maxAge).toBe(CookieConfig.DEFAULT_MAX_AGE);
      expect(result.sameSite).toBe(CookieConfig.DEFAULT_SAME_SITE);
      expect(result.secure).toBe(CookieConfig.DEFAULT_SECURE);
    });

    it('should merge provided sameSite with defaults', () => {
      const input = {sameSite: 'strict' as const};

      const result = getSessionCookieOptions(input);

      expect(result.sameSite).toBe('strict');
      expect(result.httpOnly).toBe(CookieConfig.DEFAULT_HTTP_ONLY);
      expect(result.maxAge).toBe(CookieConfig.DEFAULT_MAX_AGE);
      expect(result.secure).toBe(CookieConfig.DEFAULT_SECURE);
    });
  });

  describe('complete override', () => {
    it('should use all provided values when all options are specified', () => {
      const input = {
        httpOnly: false,
        maxAge: 7200,
        sameSite: 'strict' as const,
        secure: false,
      };

      const result = getSessionCookieOptions(input);

      expect(result).toEqual({
        httpOnly: false,
        maxAge: 7200,
        sameSite: 'strict',
        secure: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should treat undefined values as not provided', () => {
      const input = {
        maxAge: undefined,
        secure: undefined,
      };

      const result = getSessionCookieOptions(input);

      expect(result.maxAge).toBe(CookieConfig.DEFAULT_MAX_AGE);
      expect(result.secure).toBe(CookieConfig.DEFAULT_SECURE);
      expect(result.httpOnly).toBe(CookieConfig.DEFAULT_HTTP_ONLY);
      expect(result.sameSite).toBe(CookieConfig.DEFAULT_SAME_SITE);
    });

    it('should treat null values as not provided', () => {
      const input = {
        maxAge: null as any,
        secure: null as any,
      };

      const result = getSessionCookieOptions(input);

      expect(result.maxAge).toBe(CookieConfig.DEFAULT_MAX_AGE);
      expect(result.secure).toBe(CookieConfig.DEFAULT_SECURE);
    });

    it('should preserve false boolean values', () => {
      const input = {
        httpOnly: false,
        secure: false,
      };

      const result = getSessionCookieOptions(input);

      expect(result.httpOnly).toBe(false);
      expect(result.secure).toBe(false);
    });

    it('should handle mixed defined and undefined options', () => {
      const input = {
        maxAge: 1800,
        secure: undefined,
      };

      const result = getSessionCookieOptions(input);

      expect(result.maxAge).toBe(1800);
      expect(result.secure).toBe(CookieConfig.DEFAULT_SECURE);
    });

    it('should accept zero maxAge', () => {
      const input = {maxAge: 0};

      const result = getSessionCookieOptions(input);

      expect(result.maxAge).toBe(0);
    });

    it('should accept negative maxAge', () => {
      const input = {maxAge: -1};

      const result = getSessionCookieOptions(input);

      expect(result.maxAge).toBe(-1);
    });
  });

  describe('sameSite variations', () => {
    it('should handle sameSite strict', () => {
      const input = {sameSite: 'strict' as const};

      const result = getSessionCookieOptions(input);

      expect(result.sameSite).toBe('strict');
    });

    it('should handle sameSite lax', () => {
      const input = {sameSite: 'lax' as const};

      const result = getSessionCookieOptions(input);

      expect(result.sameSite).toBe('lax');
    });

    it('should handle sameSite none', () => {
      const input = {sameSite: 'none' as const};

      const result = getSessionCookieOptions(input);

      expect(result.sameSite).toBe('none');
    });

    it('should handle sameSite true', () => {
      const input = {sameSite: true};

      const result = getSessionCookieOptions(input);

      expect(result.sameSite).toBe(true);
    });

    it('should handle sameSite false', () => {
      const input = {sameSite: false};

      const result = getSessionCookieOptions(input);

      expect(result.sameSite).toBe(false);
    });
  });
});
