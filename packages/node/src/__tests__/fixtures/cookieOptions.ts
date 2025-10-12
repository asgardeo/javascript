import {CookieOptions} from '../../models/cookies';

/**
 * Default cookie options matching CookieConfig defaults
 */
export const defaultCookieOptions: CookieOptions = {
  httpOnly: true,
  maxAge: 3600,
  sameSite: 'lax',
  secure: true,
};

/**
 * Custom cookie options with non-default values
 */
export const customCookieOptions: CookieOptions = {
  httpOnly: false,
  maxAge: 7200,
  sameSite: 'strict',
  secure: false,
};

/**
 * Partial cookie options for testing merging behavior
 */
export const partialCookieOptions: Partial<CookieOptions> = {
  maxAge: 1800,
};

/**
 * All possible sameSite variations for testing
 */
export const sameSiteVariations = ['strict' as const, 'lax' as const, 'none' as const, true, false];
