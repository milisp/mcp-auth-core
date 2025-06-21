// Example: How to use MCP-Auth in your MCP server

import { createMCPAuth } from "./index";
import { writeFile, readFile } from "fs/promises";

// Simple file storage implementation
class FileStorage {
  constructor(private filePath: string) {}

  async save(tokens: Record<string, any>): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(tokens, null, 2));
  }

  async load(): Promise<Record<string, any> | null> {
    try {
      const data = await readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

// Initialize MCP-Auth
const storage = new FileStorage("./tokens.json");
const auth = createMCPAuth(storage);

// Add your own service configurations
auth.registerService("notion", {
  clientId: process.env.NOTION_CLIENT_ID!,
  clientSecret: process.env.NOTION_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback",
  scopes: ["read_content", "write_content"],
  provider: {
    name: "Notion",
    authUrl: "https://api.notion.com/v1/oauth/authorize",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
    userInfoUrl: "https://api.notion.com/v1/users/me",
  },
});

// Example MCP server setup
async function setupMCPServer() {
  console.log("🚀 Starting MCP server with universal auth...");

  // Tool: Read Gmail
  async function readGmail(userId: string) {
    try {
      const response = await auth.makeRequest(
        "gmail",
        userId,
        "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10",
      );

      const data = await response.json();
      return {
        success: true,
        messages: data.messages || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `Gmail access failed: ${error.message}`,
        authUrl: auth.getAuthUrl("gmail", `gmail-${userId}`),
      };
    }
  }

  // Tool: Create GitHub issue
  async function createGitHubIssue(
    userId: string,
    repo: string,
    title: string,
    body: string,
  ) {
    try {
      const response = await auth.makeRequest(
        "github",
        userId,
        `https://api.github.com/repos/${repo}/issues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        },
      );

      const issue = await response.json();
      return {
        success: true,
        issueUrl: issue.html_url,
        issueNumber: issue.number,
      };
    } catch (error) {
      return {
        success: false,
        error: `GitHub access failed: ${error.message}`,
        authUrl: auth.getAuthUrl("github", `github-${userId}`),
      };
    }
  }

  // Tool: Update Notion page
  async function updateNotionPage(
    userId: string,
    pageId: string,
    content: string,
  ) {
    try {
      const response = await auth.makeRequest(
        "notion",
        userId,
        `https://api.notion.com/v1/pages/${pageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({
            properties: {
              title: {
                title: [{ text: { content } }],
              },
            },
          }),
        },
      );

      return {
        success: true,
        page: await response.json(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Notion access failed: ${error.message}`,
        authUrl: auth.getAuthUrl("notion", `notion-${userId}`),
      };
    }
  }

  return {
    readGmail,
    createGitHubIssue,
    updateNotionPage,
  };
}

// Express server for OAuth callbacks
import express from "express";

const app = express();

// Handle OAuth callbacks
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).send("Missing code or state");
  }

  try {
    // Parse service from state
    const [service] = (state as string).split("-");

    // Exchange code for token
    const token = await auth.handleCallback(service, code as string);

    res.send(`
      <h1>✅ Authentication Successful!</h1>
      <p>You can now close this window and return to your MCP client.</p>
      <script>window.close();</script>
    `);
  } catch (error) {
    res.status(400).send(`Authentication failed: ${error.message}`);
  }
});

// Start the server
app.listen(3000, () => {
  console.log("🔐 OAuth callback server running on http://localhost:3000");
});

// Example usage in your MCP tools
async function exampleUsage() {
  const server = await setupMCPServer();
  const userId = "user123";

  console.log("📧 Reading Gmail...");
  const gmailResult = await server.readGmail(userId);

  if (!gmailResult.success) {
    console.log(`Please authenticate: ${gmailResult.authUrl}`);
  } else {
    console.log(`Found ${gmailResult.messages.length} messages`);
  }

  console.log("🐙 Creating GitHub issue...");
  const githubResult = await server.createGitHubIssue(
    userId,
    "user/repo",
    "Bug found by AI agent",
    "This issue was automatically created by an MCP server with universal auth!",
  );

  if (!githubResult.success) {
    console.log(`Please authenticate: ${githubResult.authUrl}`);
  } else {
    console.log(`Created issue: ${githubResult.issueUrl}`);
  }
}

// The magic: One auth system, all services
console.log(`
🎯 MCP-Auth: The Universal Standard

✅ No more custom OAuth for each service
✅ Automatic token refresh  
✅ Secure storage
✅ Easy service integration
✅ One API to rule them all

Ready to make everyone else follow YOUR standard? 😎
`);

export { auth, setupMCPServer };
