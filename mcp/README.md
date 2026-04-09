# Xingdianping Database MCP Server

这是一个让AI可以通过 **Model Context Protocol (MCP)** 访问星点评(Xingdianping)数据库的MCP服务器。

## 功能

提供以下工具供AI调用：

| 工具名 | 功能 |
|--------|------|
| `raw_sql_query` | 执行只读SQL查询 (仅限SELECT) |
| `search_ai_tools` | 按关键词/分类/标签搜索AI工具 |
| `get_tool_detail` | 获取单个AI工具的详细信息 |
| `list_all_tags` | 列出所有标签 |
| `list_all_categories` | 列出所有分类 |
| `get_statistics` | 获取数据库统计信息 |

## 安装依赖

```bash
cd mcp
pip install -r requirements.txt
```

**注意**: 由于MCP服务器复用了后端已有的配置和数据库连接，所以需要确保已经安装了后端的所有依赖。

## 在 Claude Desktop 中配置

打开 Claude Desktop 配置文件 `claude_desktop_config.json`:

- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

添加如下配置：

```json
{
  "mcpServers": {
    "xingdianping-db": {
      "command": "python",
      "args": [
        "d:/codespace/workfile/mcp/server.py"
      ],
      "cwd": "d:/codespace/workfile"
    }
  }
}
```

修改 `d:/codespace/workfile` 为你的实际项目路径。

## 重启 Claude Desktop

配置完成后，重启 Claude Desktop，你就能看到MCP服务器提供的工具了。AI现在可以：

- 直接查询数据库内容
- 搜索AI工具信息
- 获取统计数据
- 帮助你分析数据

## 安全说明

- 这个MCP服务器**只允许SELECT查询**，不支持写操作，保护你的数据安全
- 只在本地运行，不会把数据发送到第三方
- 数据库连接信息从后端 `.env` 文件读取，复用现有配置

## 使用示例

AI可以这样查询：
- "帮我找一下所有免费的AI写作工具"
- "统计一下数据库里有多少工具，有哪些分类"
- "帮我看看中文友好这个标签下都有哪些工具"
- "搜索一下和PPT相关的工具"
