# aitoolbox

这是一个基于 React 18、Vite 6、React Router 7 和 Tailwind CSS 4 构建的 `aitoolbox` 演示项目。

## 项目特点

- 完整的页面路由系统：首页、榜单页、工具详情页、场景列表页、场景详情页
- AI 智能推荐功能：前端通过 `/api/recommend` 调用本地 mock 推荐链路
- 响应式设计：支持桌面端和移动端
- 使用本地 JSON 数据，无需数据库即可演示
- 已沉淀基础测试与可复用 UI 资产

## 技术栈

- React 18.3.1
- React Router 7.13.0
- Tailwind CSS 4.1.12
- TypeScript
- Vite 6.3.5
- Lucide React
- Vitest + Testing Library

## 项目结构

```text
/src
  /app
    /components
      Header.tsx
      Footer.tsx
      HeroSearchPanel.tsx
      ToolCard.tsx
      RankingCard.tsx
      ScenarioCard.tsx
      BrandMark.tsx
      Breadcrumbs.tsx
      RouteFeedback.tsx
      /ui
    /layouts
      RootLayout.tsx
    /pages
      HomePage.tsx
      RankingsPage.tsx
      ToolDetailPage.tsx
      ScenariosPage.tsx
      ScenarioDetailPage.tsx
    /api
      recommend.ts
    /utils
      mockApi.ts
    App.tsx
    routes.tsx
  /data
    tools.json
    scenarios.json
  /styles
    index.css
    theme.css
    tailwind.css
    fonts.css
```

## 功能说明

### 首页（`/`）

- Hero 文案区与工作台主面板
- AI 搜索推荐面板
- 2 个 Hero 信息卡
- 4 个榜单入口卡片
- 7 个工具分类标签
- 6 个推荐工具卡片
- 4 个场景入口

### 榜单页（`/rankings`）

- 榜单 Tab 切换
- 筛选 Chip 切换
- 排名卡片列表
- 空状态提示

### 工具详情页（`/tools/:slug`）

- 工具基础信息
- 工具简介
- 核心能力
- 适合人群
- 优点与不足
- 推荐场景
- 平替推荐
- 编辑点评

### 场景页（`/scenarios`）

- 场景列表
- 返回首页做智能推荐的引导区块

### 场景详情页（`/scenarios/:slug`）

- 场景说明
- 主推荐工具
- 备选方案
- 适合人群
- 其他场景入口

## 数据说明

### 工具数据

- 文件：`src/data/tools.json`
- 当前共 19 个工具

字段包括：

- `slug`
- `name`
- `category`
- `score`
- `summary`
- `description`
- `tags`
- `pros`
- `cons`
- `scenarios`
- `alternatives`
- `officialUrl`
- `editorComment`
- `abilities`
- `targetAudience`

### 场景数据

- 文件：`src/data/scenarios.json`
- 当前共 8 个场景

字段包括：

- `slug`
- `title`
- `description`
- `problem`
- `primaryTools`
- `alternativeTools`
- `targetAudience`
- `toolCount`

## 推荐接口说明

当前没有真实后端。应用启动时会加载 `src/app/utils/mockApi.ts`，覆盖 `window.fetch` 并拦截 `/api/*` 请求。

当前推荐接口为：

```http
POST /api/recommend
Content-Type: application/json
```

请求体：

```json
{
  "query": "做 PPT 用什么 AI？"
}
```

成功响应为推荐结果数组，最多返回 3 条：

```json
[
  {
    "name": "Gamma",
    "slug": "gamma",
    "reason": "Gamma 在 PPT 制作方面表现出色，能够快速生成精美的演示文稿，大幅提升工作效率。",
    "tags": ["PPT", "演示", "自动排版"],
    "score": 9.1
  }
]
```

## 设计方向

当前前端采用的是“天空渐层背景 + 半透明玻璃卡片 + 深色主操作”的轻玻璃工作台风格，不再是旧版深色 Hero + 暖灰内容卡的方案。

## 运行项目

```bash
npm install
npm run dev
```

测试：

```bash
npm test
```

## 注意事项

1. 本项目为演示 Demo，不包含真实后端。
2. 所有 `/api/*` 调用均为浏览器侧 mock。
3. 当前筛选能力是前端本地规则，不依赖服务端。
4. 后续若接真实后端，建议保持 `/api/recommend` 契约不变。

## 后续建议

- 为 Logo 图包建立 `tool.slug -> logo` 映射
- 为 `tools.json` 和 `scenarios.json` 增加 schema 校验
- 继续补页面级测试
- 逐步清理未使用依赖
