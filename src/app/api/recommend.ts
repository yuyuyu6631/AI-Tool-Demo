import toolsData from "../../data/tools.json";

interface RecommendRequest {
  query: string;
}

interface RecommendResponse {
  name: string;
  slug: string;
  reason: string;
  tags: string[];
  score: number;
}

// 简单的关键词匹配推荐逻辑
export async function recommendTools(
  query: string
): Promise<RecommendResponse[]> {
  const lowerQuery = query.toLowerCase();

  // 场景匹配规则
  const scenarioRules: Record<string, string[]> = {
    ppt: ["ppt", "演示", "幻灯片", "汇报", "presentation"],
    writing: ["写作", "文章", "内容", "文案", "公众号", "博客"],
    coding: ["编程", "代码", "开发", "程序", "code", "programming"],
    design: ["设计", "绘画", "画图", "ui", "logo", "海报"],
    video: ["视频", "剪辑", "短视频", "音频", "配音"],
    data: ["数据", "分析", "图表", "可视化", "报表"],
    agent: ["智能体", "机器人", "客服", "对话", "chatbot"],
    meeting: ["会议", "记录", "转写", "总结"],
  };

  // 工具匹配规则
  const toolRules: Record<string, string[]> = {
    chatgpt: ["chatgpt", "gpt", "openai"],
    claude: ["claude", "anthropic"],
    gamma: ["gamma", "ppt", "演示"],
    cursor: ["cursor", "编程", "代码"],
    midjourney: ["midjourney", "绘画", "画图"],
    "notion-ai": ["notion", "笔记"],
    copilot: ["copilot", "github"],
    coze: ["扣子", "coze", "智能体"],
  };

  const results: RecommendResponse[] = [];
  const recommendedSlugs = new Set<string>();

  // 1. 先尝试直接工具名匹配
  for (const [slug, keywords] of Object.entries(toolRules)) {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      const tool = toolsData.find((t) => t.slug === slug);
      if (tool && !recommendedSlugs.has(slug)) {
        results.push({
          name: tool.name,
          slug: tool.slug,
          reason: `${tool.name} 是 ${tool.category} 领域的优秀工具，${tool.summary}`,
          tags: tool.tags,
          score: tool.score,
        });
        recommendedSlugs.add(slug);
      }
    }
  }

  // 2. 场景匹配
  if (results.length < 3) {
    for (const [scenario, keywords] of Object.entries(scenarioRules)) {
      if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
        let categoryTools: typeof toolsData = [];

        switch (scenario) {
          case "ppt":
            categoryTools = toolsData.filter(
              (t) => t.slug === "gamma" || t.slug === "canva-ai"
            );
            break;
          case "writing":
            categoryTools = toolsData.filter(
              (t) =>
                t.category === "写作办公" || t.slug === "chatgpt" || t.slug === "claude"
            );
            break;
          case "coding":
            categoryTools = toolsData.filter((t) => t.category === "编程开发");
            break;
          case "design":
            categoryTools = toolsData.filter((t) => t.category === "设计绘图");
            break;
          case "video":
            categoryTools = toolsData.filter((t) => t.category === "视频音频");
            break;
          case "data":
            categoryTools = toolsData.filter(
              (t) => t.category === "数据分析" || t.slug === "chatgpt"
            );
            break;
          case "agent":
            categoryTools = toolsData.filter((t) => t.category === "智能体平台");
            break;
          case "meeting":
            categoryTools = toolsData.filter((t) => t.slug === "fireflies");
            break;
        }

        // 按评分排序并添加
        categoryTools
          .sort((a, b) => b.score - a.score)
          .forEach((tool) => {
            if (!recommendedSlugs.has(tool.slug) && results.length < 3) {
              results.push({
                name: tool.name,
                slug: tool.slug,
                reason: generateReason(tool, scenario),
                tags: tool.tags,
                score: tool.score,
              });
              recommendedSlugs.add(tool.slug);
            }
          });

        if (results.length >= 3) break;
      }
    }
  }

  // 3. 如果还是没有结果，返回热门工具
  if (results.length === 0) {
    const topTools = [...toolsData].sort((a, b) => b.score - a.score).slice(0, 3);
    topTools.forEach((tool) => {
      results.push({
        name: tool.name,
        slug: tool.slug,
        reason: `${tool.name} 是热门 AI 工具，综合评分 ${tool.score}，适合多种场景使用。`,
        tags: tool.tags,
        score: tool.score,
      });
    });
  }

  return results.slice(0, 3);
}

function generateReason(tool: any, scenario: string): string {
  const reasonMap: Record<string, string> = {
    ppt: `${tool.name} 在 PPT 制作方面表现出色，能够快速生成精美的演示文稿，大幅提升工作效率。`,
    writing: `${tool.name} 擅长内容创作和文案生成，可以帮助你快速产出高质量文章。`,
    coding: `${tool.name} 是优秀的编程辅助工具，提供智能代码补全和生成功能，提升开发效率。`,
    design: `${tool.name} 在设计领域表现优异，能够生成高质量的设计作品。`,
    video: `${tool.name} 专注于视频创作，提供强大的编辑和生成能力。`,
    data: `${tool.name} 在数据分析方面功能强大，支持智能可视化和自然语言查询。`,
    agent: `${tool.name} 是专业的智能体搭建平台，支持快速构建企业级 AI 应用。`,
    meeting: `${tool.name} 专注于会议场景，提供自动录音、转写和总结功能。`,
  };

  return (
    reasonMap[scenario] || `${tool.name} 在 ${tool.category} 领域表现优秀，${tool.summary}`
  );
}
