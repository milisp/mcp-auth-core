// MCP-Auth: Universal Authentication for MCP Servers
// The standard that everyone should follow

// Export main class
export { MCPAuth } from './mcp-auth';

// Export types
export type {
  MCPAuthConfig,
  AuthToken,
  AuthProvider,
  AuthStorage,
} from './types';

// Export built-in providers
export { PROVIDERS } from './providers';

// Re-export providers for convenience
export { PROVIDERS as providers } from './providers';
