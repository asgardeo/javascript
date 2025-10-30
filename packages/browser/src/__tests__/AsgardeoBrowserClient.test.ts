import { describe, it, expect } from 'vitest';
import AsgardeoBrowserClient from '../AsgardeoBrowserClient';
import { AsgardeoBrowserConfig } from '../models/config';
import type {
    AllOrganizationsApiResponse,
    EmbeddedFlowExecuteRequestPayload,
    EmbeddedFlowExecuteResponse,
    EmbeddedSignInFlowHandleRequestPayload,
    Organization,
    SignInOptions,
    SignOutOptions,
    SignUpOptions,
    Storage,
    TokenExchangeRequestConfig,
    TokenResponse,
    User,
    UserProfile,
} from '@asgardeo/javascript';
import { AsgardeoJavaScriptClient } from '@asgardeo/javascript';

class TestBrowserClient extends AsgardeoBrowserClient<AsgardeoBrowserConfig> {
    private _config!: AsgardeoBrowserConfig;
    private _loading = false;

    async switchOrganization(_organization: Organization, _sessionId?: string): Promise<TokenResponse | Response> {
        return { accessToken: 'token' } as TokenResponse;
    }

    async initialize(config: AsgardeoBrowserConfig, _storage?: Storage): Promise<boolean> {
        this._config = config;
        this._loading = false;
        return true;
    }

    async reInitialize(_config: Partial<AsgardeoBrowserConfig>): Promise<boolean> {
        return true;
    }

    async getUser(_options?: any): Promise<User> {
        return { id: 'u1' } as unknown as User;
    }

    async getAllOrganizations(_options?: any, _sessionId?: string): Promise<AllOrganizationsApiResponse> {
        return { hasMore: false, organizations: [] } as AllOrganizationsApiResponse;
    }

    async getMyOrganizations(_options?: any, _sessionId?: string): Promise<Organization[]> {
        return [] as Organization[];
    }

    async getCurrentOrganization(_sessionId?: string): Promise<Organization | null> {
        return null;
    }

    async getUserProfile(_options?: any): Promise<UserProfile> {
        return { id: 'u1' } as unknown as UserProfile;
    }

    isLoading(): boolean {
        return this._loading;
    }

    async isSignedIn(): Promise<boolean> {
        return true;
    }

    async updateUserProfile(_payload: any, _userId?: string): Promise<User> {
        return { id: 'u1' } as unknown as User;
    }

    getConfiguration(): AsgardeoBrowserConfig {
        return this._config;
    }

    async exchangeToken(_config: TokenExchangeRequestConfig, _sessionId?: string): Promise<TokenResponse | Response> {
        return { accessToken: 'token' } as TokenResponse;
    }

    // signIn overloads
    async signIn(_options?: SignInOptions, _sessionId?: string, _onSignInSuccess?: (afterSignInUrl: string) => void): Promise<User>;
    async signIn(
        _payload: EmbeddedSignInFlowHandleRequestPayload,
        _request: Request,
        _sessionId?: string,
        _onSignInSuccess?: (afterSignInUrl: string) => void,
    ): Promise<User>;
    async signIn(): Promise<User> {
        return { id: 'u1' } as unknown as User;
    }

    async signInSilently(_options?: SignInOptions): Promise<User | boolean> {
        return false;
    }

    // signOut overloads
    async signOut(_options?: SignOutOptions, _afterSignOut?: (afterSignOutUrl: string) => void): Promise<string>;
    async signOut(
        _options?: SignOutOptions,
        _sessionId?: string,
        _afterSignOut?: (afterSignOutUrl: string) => void,
    ): Promise<string>;
    async signOut(): Promise<string> {
        return 'signed-out';
    }

    // signUp overloads
    async signUp(_options?: SignUpOptions): Promise<void>;
    async signUp(_payload: EmbeddedFlowExecuteRequestPayload): Promise<EmbeddedFlowExecuteResponse>;
    async signUp(): Promise<void | EmbeddedFlowExecuteResponse> {
        return undefined;
    }

    async getAccessToken(_sessionId?: string): Promise<string> {
        return 'token';
    }

    clearSession(_sessionId?: string): void { }
}

describe('AsgardeoBrowserClient', () => {
    it('should be a class export (default)', () => {
        expect(typeof AsgardeoBrowserClient).toBe('function');
    });

    it('should allow creating a concrete subclass instance', async () => {
        const client = new TestBrowserClient();
        expect(client).toBeInstanceOf(TestBrowserClient);
        // Inheritance check against the base JS client
        expect(client).toBeInstanceOf(AsgardeoJavaScriptClient as unknown as Function);

        const config: AsgardeoBrowserConfig = {
            baseUrl: 'https://example.org/t/acme',
            clientId: 'abc',
            storage: 'browserMemory',
        };

        const initialized = await client.initialize(config);
        expect(initialized).toBe(true);
        expect(client.getConfiguration()).toEqual(config);
    });

    it('should return stubbed values for core methods', async () => {
        const client = new TestBrowserClient();
        await client.initialize({ baseUrl: 'https://x', clientId: 'y', storage: 'browserMemory' });

        expect(client.isLoading()).toBe(false);
        await expect(client.isSignedIn()).resolves.toBe(true);

        await expect(client.getUser()).resolves.toBeTruthy();
        await expect(client.getUserProfile()).resolves.toBeTruthy();

        await expect(client.getMyOrganizations()).resolves.toEqual([]);
        await expect(client.getAllOrganizations()).resolves.toMatchObject({ hasMore: false });
        await expect(client.getCurrentOrganization()).resolves.toBeNull();

        await expect(client.getAccessToken()).resolves.toBe('token');
        await expect(
            client.exchangeToken({
                attachToken: false,
                data: {},
                id: 'req-1',
                returnsSession: false,
                signInRequired: false,
            } as TokenExchangeRequestConfig),
        ).resolves.toBeTruthy();

        await expect(client.signIn()).resolves.toBeTruthy();
        await expect(client.signInSilently()).resolves.toBe(false);
        await expect(client.signOut()).resolves.toBe('signed-out');

        // signUp returns void in our stub
        await expect(client.signUp()).resolves.toBeUndefined();
    });
});
