// src/server/actions/__tests__/getOrganizationAction.test.ts
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

// Mock client factory BEFORE importing the SUT
vi.mock('../../../AsgardeoNextClient', () => ({
  default: {
    getInstance: vi.fn(),
  },
}));

// Import SUT and mocked deps
import getOrganizationAction from '../getOrganizationAction';
import AsgardeoNextClient from '../../../AsgardeoNextClient';

// Minimal shape for testing; add fields only if you assert on them
type OrganizationDetails = { id: string; name: string; orgHandle?: string };

describe('getOrganizationAction', () => {
  const mockClient = {
    getOrganization: vi.fn(),
  };

  const orgId = 'org-001';
  const sessionId = 'sess-123';
  const org: OrganizationDetails = { id: orgId, name: 'Alpha', orgHandle: 'alpha' };

  beforeEach(() => {
    vi.resetAllMocks();
    (AsgardeoNextClient.getInstance as unknown as Mock).mockReturnValue(mockClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return success with organization when upstream succeeds', async () => {
    mockClient.getOrganization.mockResolvedValueOnce(org);

    const result = await getOrganizationAction(orgId, sessionId);

    expect(AsgardeoNextClient.getInstance).toHaveBeenCalledTimes(1);
    expect(mockClient.getOrganization).toHaveBeenCalledWith(orgId, sessionId);

    expect(result).toEqual({
      success: true,
      data: { organization: org },
      error: null,
    });
  });

  it('should pass through empty-string organizationId and sessionId (documents current behavior)', async () => {
    mockClient.getOrganization.mockResolvedValueOnce(org);

    const result = await getOrganizationAction('', '');

    expect(mockClient.getOrganization).toHaveBeenCalledWith('', '');
    expect(result.success).toBe(true);
    expect(result.data.organization).toEqual(org);
  });

  it('should return failure shape when client.getOrganization rejects', async () => {
    mockClient.getOrganization.mockRejectedValueOnce(new Error('upstream down'));

    const result = await getOrganizationAction(orgId, sessionId);

    expect(result).toEqual({
      success: false,
      data: { user: {} },
      error: 'Failed to get organization',
    });
  });

  it('should return failure shape when AsgardeoNextClient.getInstance throws', async () => {
    (AsgardeoNextClient.getInstance as unknown as Mock).mockImplementationOnce(() => {
      throw new Error('factory failed');
    });

    const result = await getOrganizationAction(orgId, sessionId);

    expect(result).toEqual({
      success: false,
      data: { user: {} },
      error: 'Failed to get organization',
    });
  });

  it('should return failure shape when client rejects with a non-Error value', async () => {
  mockClient.getOrganization.mockRejectedValueOnce('bad');
  const result = await getOrganizationAction(orgId, sessionId);
  expect(result).toEqual({
    success: false,
    data: { user: {} },
    error: 'Failed to get organization',
  });
});


  it('should not mutate the organization object returned by upstream', async () => {
    const upstreamOrg = { ...org, extra: { nested: true } };
    mockClient.getOrganization.mockResolvedValueOnce(upstreamOrg);

    const result = await getOrganizationAction(orgId, sessionId);

    expect(result.data.organization).toEqual(upstreamOrg);
  });
});
