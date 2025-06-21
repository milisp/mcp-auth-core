import { MCPAuth, PROVIDERS } from '../src/index';

// Example: Google OAuth integration
async function googleAuthExample() {
  // Create auth instance
  const auth = new MCPAuth();

  // Register Google OAuth service
  auth.registerService('my-google-app', {
    clientId: 'your-google-client-id',
    clientSecret: 'your-google-client-secret',
    redirectUri: 'http://localhost:3000/auth/callback',
    scopes: ['profile', 'email'],
    provider: PROVIDERS.google
  });

  // Step 1: Get authorization URL
  const authUrl = auth.getAuthUrl('my-google-app');
  console.log('Authorization URL:', authUrl);
  console.log('User should visit this URL to authorize the application');

  // Step 2: Handle callback (this would be in your server)
  // const code = 'authorization_code_from_callback';
  // const token = await auth.handleCallback('my-google-app', code);
  // console.log('Access token:', token.accessToken);

  // Step 3: Make authenticated requests
  // const response = await auth.makeRequest(
  //   'my-google-app', 
  //   token.userId, 
  //   'https://www.googleapis.com/oauth2/v2/userinfo'
  // );
  // const userInfo = await response.json();
  // console.log('User info:', userInfo);
}

// Example: GitHub OAuth integration
async function githubAuthExample() {
  const auth = new MCPAuth();

  auth.registerService('my-github-app', {
    clientId: 'your-github-client-id',
    redirectUri: 'http://localhost:3000/auth/callback',
    scopes: ['user', 'repo'],
    provider: PROVIDERS.github
  });

  const authUrl = auth.getAuthUrl('my-github-app');
  console.log('GitHub Authorization URL:', authUrl);
}

// Run examples
googleAuthExample();
githubAuthExample(); 