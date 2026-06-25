# mcp-harvard-art

Harvard Art Museums MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 960+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search the Harvard Art Museums collection by keyword. Returns matching items with ids (pass an id to object), titles, creators, dates and image links. |
| `object` | Fetch full details for one Harvard Art Museums item by id — a Harvard Art Museums object id (numeric, from search). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "harvard-art": {
      "url": "https://gateway.pipeworx.io/harvard-art/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 960+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Harvard Art data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
