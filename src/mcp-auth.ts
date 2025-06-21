import type { MCPAuthConfig, AuthToken, AuthStorage } from './types';

export class MCPAuth {
  private tokens: Map<string, AuthToken> = new Map();
  private configs: Map<string, MCPAuthConfig> = new Map();

  constructor(private storage?: AuthStorage) {
    this.loadTokens();
  }

  // Register a service configuration
  registerService(serviceId: string, config: MCPAuthConfig) {
    this.configs.set(serviceId, config);
  }

  // Get authorization URL - this is what the user clicks
  getAuthUrl(serviceId: string, state?: string): string {
    const config = this.configs.get(serviceId);
    if (!config) throw new Error(`Service ${serviceId} not configured`);

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(" "),
      response_type: "code",
      state: state || this.generateState(),
    });

    return `${config.provider.authUrl}?${params.toString()}`;
  }

  // Handle the callback after user authorizes
  async handleCallback(serviceId: string, code: string): Promise<AuthToken> {
    const config = this.configs.get(serviceId);
    if (!config) throw new Error(`Service ${serviceId} not configured`);

    const tokenData = await this.exchangeCodeForToken(config, code);
    const token: AuthToken = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      scopes: config.scopes,
      userId: await this.getUserId(config, tokenData.access_token),
    };

    const tokenKey = `${serviceId}:${token.userId}`;
    this.tokens.set(tokenKey, token);
    await this.saveTokens();

    return token;
  }

  // Get valid token for a user and service
  async getToken(serviceId: string, userId: string): Promise<string> {
    const tokenKey = `${serviceId}:${userId}`;
    let token = this.tokens.get(tokenKey);

    if (!token) {
      throw new Error(`No token found for ${serviceId}:${userId}`);
    }

    // Check if token is expired and refresh if needed
    if (token.expiresAt < new Date() && token.refreshToken) {
      token = await this.refreshToken(serviceId, token);
      this.tokens.set(tokenKey, token);
      await this.saveTokens();
    }

    return token.accessToken;
  }

  // Make authenticated request - this is the magic
  async makeRequest(
    serviceId: string,
    userId: string,
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = await this.getToken(serviceId, userId);

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    return fetch(url, { ...options, headers });
  }

  // Refresh expired token
  private async refreshToken(
    serviceId: string,
    token: AuthToken,
  ): Promise<AuthToken> {
    const config = this.configs.get(serviceId);
    if (!config || !token.refreshToken) {
      throw new Error("Cannot refresh token");
    }

    const response = await fetch(config.provider.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret || "",
      }),
    });

    const tokenData = await response.json();

    return {
      ...token,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || token.refreshToken,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  }

  // Exchange authorization code for token
  private async exchangeCodeForToken(config: MCPAuthConfig, code: string) {
    const response = await fetch(config.provider.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret || "",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user ID from provider
  private async getUserId(
    config: MCPAuthConfig,
    accessToken: string,
  ): Promise<string> {
    if (!config.provider.userInfoUrl) return "default";

    const response = await fetch(config.provider.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userInfo = await response.json();
    return userInfo.id || userInfo.login || userInfo.email || "default";
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async loadTokens() {
    if (this.storage) {
      const saved = await this.storage.load();
      if (saved) {
        this.tokens = new Map(
          Object.entries(saved).map(([k, v]) => [
            k,
            { ...v, expiresAt: new Date(v.expiresAt) },
          ]),
        );
      }
    }
  }

  private async saveTokens() {
    if (this.storage) {
      const toSave = Object.fromEntries(this.tokens.entries());
      await this.storage.save(toSave);
    }
  }
} 