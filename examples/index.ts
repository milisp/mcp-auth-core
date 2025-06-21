import { MCPAuth, AuthStorage, PROVIDERS } from "../src/index";

// Example usage
export function createMCPAuth(storage?: AuthStorage) {
  const auth = new MCPAuth(storage);

  // Pre-configure popular services
  auth.registerService("gmail", {
    clientId: "your-google-client-id",
    clientSecret: "your-google-secret",
    redirectUri: "http://localhost:3000/auth/callback",
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
    provider: PROVIDERS.google,
  });

  auth.registerService("github", {
    clientId: "your-github-client-id",
    clientSecret: "your-github-secret",
    redirectUri: "http://localhost:3000/auth/callback",
    scopes: ["repo", "user"],
    provider: PROVIDERS.github,
  });

  return auth;
}
