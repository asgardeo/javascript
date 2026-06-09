import { describe, it, expect, vi, beforeEach } from 'vitest';
import getDisplayName from '../../utils/getDisplayName';

vi.mock('../../utils/getMappedUserProfileValue', () => ({
  default: vi.fn(),
}));

import getMappedUserProfileValue from '../../utils/getMappedUserProfileValue';

const mockGet = getMappedUserProfileValue as ReturnType<typeof vi.fn>;

describe('getDisplayName', () => {
  const mergedMappings = {};
  const user = {} as any;

  beforeEach(() => {
    mockGet.mockReset();
  });

  it('returns User when nothing is found', () => {
    mockGet.mockReturnValue(undefined);
    const result = getDisplayName(mergedMappings, user);
    expect(result).toBe('User');
  });

  it('returns firstName and lastName combined', () => {
    mockGet.mockReturnValueOnce('Jane');
    mockGet.mockReturnValueOnce('Doe');
    const result = getDisplayName(mergedMappings, user);
    expect(result).toBe('Jane Doe');
  });

  it('returns username when no firstName or lastName', () => {
    mockGet.mockReturnValueOnce(undefined);
    mockGet.mockReturnValueOnce(undefined);
    mockGet.mockReturnValueOnce('janedoe');
    const result = getDisplayName(mergedMappings, user);
    expect(result).toBe('janedoe');
  });

  it('returns email when no firstName lastName or username', () => {
    mockGet.mockReturnValueOnce(undefined);
    mockGet.mockReturnValueOnce(undefined);
    mockGet.mockReturnValueOnce(undefined);
    mockGet.mockReturnValueOnce('jane@example.com');
    const result = getDisplayName(mergedMappings, user);
    expect(result).toBe('jane@example.com');
  });

  it('returns value from displayAttributes when found', () => {
    mockGet.mockReturnValueOnce('John');
    const result = getDisplayName(mergedMappings, user, ['firstName']);
    expect(result).toBe('John');
  });

  it('skips empty displayAttributes and uses firstName and lastName', () => {
    mockGet.mockReturnValueOnce('Jane');
    mockGet.mockReturnValueOnce('Doe');
    const result = getDisplayName(mergedMappings, user, []);
    expect(result).toBe('Jane Doe');
  });
});