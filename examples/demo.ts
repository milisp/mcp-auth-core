import { MCPAuth, AuthStorage, PROVIDERS } from "../src/index";

// MCP Server integration example
export class MCPServer {
  constructor(private auth: MCPAuth) {}

  async handleToolCall(toolName: string, params: any, userId: string) {
    switch (toolName) {
      case "read_gmail":
        const response = await this.auth.makeRequest(
          "gmail",
          userId,
          "https://gmail.googleapis.com/gmail/v1/users/me/messages",
        );
        return response.json();

      case "create_github_issue":
        return await this.auth.makeRequest(
          "github",
          userId,
          `https://api.github.com/repos/${params.repo}/issues`,
          {
            method: "POST",
            body: JSON.stringify({
              title: params.title,
              body: params.body,
            }),
          },
        );

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
