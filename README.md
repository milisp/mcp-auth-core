# MCP Auth Core

Universal Authentication for MCP Servers - The standard that everyone should follow.

A lightweight, modular authentication library that provides OAuth2 support for popular providers like Google, GitHub, Slack, and Microsoft.

## Installation

```bash
npm install mcp-auth-core
```

## Quick Start

```typescript
import { MCPAuth, PROVIDERS } from 'mcp-auth-core';

// Create auth instance
const auth = new MCPAuth();

// Register a service with Google OAuth
auth.registerService('my-app', {
  clientId: 'your-google-client-id',
  clientSecret: 'your-google-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  scopes: ['profile', 'email'],
  provider: PROVIDERS.google
});

// Get authorization URL
const authUrl = auth.getAuthUrl('my-app');
console.log('Visit this URL to authorize:', authUrl);

// Handle callback (in your server)
const token = await auth.handleCallback('my-app', authorizationCode);

// Make authenticated requests
const response = await auth.makeRequest('my-app', userId, 'https://api.example.com/data');
```

## Supported Providers

- **Google** - Full OAuth2 support with user info
- **GitHub** - OAuth2 with user profile
- **Slack** - OAuth2 for Slack apps
- **Microsoft** - Azure AD OAuth2

## Highlights

🎯 **MCP-Auth: The Universal Standard**

✅ No more custom OAuth for each service  
✅ Automatic token refresh  
✅ Secure storage  
✅ Easy service integration  
✅ One API to rule them all

## Features

- 🔐 **OAuth2 Support** - Complete OAuth2 flow implementation
- 🔄 **Token Refresh** - Automatic token refresh when expired
- 💾 **Flexible Storage** - Customizable token storage
- 🏗️ **Modular Design** - Easy to extend with custom providers
- 📦 **TypeScript** - Full TypeScript support with types
- 🌐 **Universal** - Works in Node.js and browser environments

## API Reference

### MCPAuth Class

The main authentication class that handles OAuth flows.

#### Constructor
```typescript
new MCPAuth(storage?: AuthStorage)
```

#### Methods

- `registerService(serviceId: string, config: MCPAuthConfig)` - Register a service configuration
- `getAuthUrl(serviceId: string, state?: string)` - Get authorization URL
- `handleCallback(serviceId: string, code: string)` - Handle OAuth callback
- `getToken(serviceId: string, userId: string)` - Get valid access token
- `makeRequest(serviceId: string, userId: string, url: string, options?)` - Make authenticated request

### Types

- `MCPAuthConfig` - Service configuration
- `AuthToken` - Token information
- `AuthProvider` - OAuth provider configuration
- `AuthStorage` - Storage interface for tokens

## Examples

See the `examples/` directory for complete usage examples.

## License

MIT
