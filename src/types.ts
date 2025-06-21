// MCP-Auth: Universal Authentication for MCP Servers
// Type definitions

export interface MCPAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  provider: AuthProvider;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
  userId: string;
}

export interface AuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
  revokeUrl?: string;
}

// Storage interface - implement this for your platform
export interface AuthStorage {
  save(tokens: Record<string, any>): Promise<void>;
  load(): Promise<Record<string, any> | null>;
} 