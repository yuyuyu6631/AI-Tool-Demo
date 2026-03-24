# AI 工具评测平台 Demo

这是一个基于 React + React Router + Tailwind CSS 构建的 AI 工具评测平台演示项目。

## 项目特点

- ✅ 完整的页面路由系统（首页、榜单页、工具详情页、场景推荐页）
- ✅ AI 智能推荐功能（mock 实现）
- ✅ 响应式设计，支持桌面端和移动端
- ✅ 使用 Mock 数据，无需数据库
- ✅ 现代化 UI 设计，科技感十足

## 技术栈

- React 18.3.1
- React Router 7.13.0
- Tailwind CSS 4.1.12
- TypeScript
- Vite 6.3.5
- Lucide React (图标库)

## 项目结构

```
/src
  /app
    /components        # 公共组件
      Header.tsx       # 顶部导航
      Footer.tsx       # 页脚
      ToolCard.tsx     # 工具卡片
      RankingCard.tsx  # 榜单卡片
      ScenarioCard.tsx # 场景卡片
      HeroSearchPanel.tsx # AI 搜索面板
    /pages            # 页面组件
      HomePage.tsx     # 首页
      RankingsPage.tsx # 榜单页
      ToolDetailPage.tsx # 工具详情页
      ScenariosPage.tsx # 场景列表页
      ScenarioDetailPage.tsx # 场景详情页
    /api              # API 逻辑
      recommend.ts     # 推荐算法
    /utils
      mockApi.ts       # Mock API 处理器
    App.tsx           # 应用入口
    routes.tsx        # 路由配置
  /data
    tools.json        # 工具数据（19个工具）
    scenarios.json    # 场景数据（8个场景）
  /styles
    index.css         # 样式入口
    theme.css         # 主题变量
    tailwind.css      # Tailwind 配置
```

## 功能说明

### 1. 首页（/）
- Hero 首屏，包含平台介绍和 AI 智能搜索
- 热门榜单入口（4个榜单卡片）
- 工具分类（7个分类）
- 精选推荐（8个工具卡片）
- 场景推荐（4个场景入口）

### 2. 榜单页（/rankings）
- 榜单切换（热门榜、写作榜、编程榜、智能体平台榜）
- 筛选功能（全部、国内工具、国外工具等，UI 展示）
- 榜单列表，Top 3 视觉强化
- 每个工具包含排名、名称、评分、标签、推荐理由

### 3. 工具详情页（/tools/:slug）
- 工具基础信息（名称、评分、官网链接）
- 工具简介
- 核心能力展示
- 适合人群
- 优点与不足（双栏对比）
- 推荐场景
- 平替推荐
- 编辑点评

### 4. 场景推荐页（/scenarios）
- 8个场景卡片
- 场景说明和工具数量展示

### 5. 场景详情页（/scenarios/:slug）
- 场景标题和说明
- 主推荐工具（2-3个）
- 备选方案
- 适合人群
- 其他场景入口

### 6. AI 智能推荐（核心功能）
- 输入自然语言描述需求
- 调用推荐 API（本地 mock）
- 返回 2-3 个推荐工具
- 支持示例问题快捷输入
- 显示 Loading、Success、Error、Empty 等状态

## 数据说明

### 工具数据（tools.json）
包含 19 个 AI 工具，每个工具包含：
- `slug`: 唯一标识
- `name`: 工具名称
- `category`: 分类
- `score`: 评分（0-10）
- `summary`: 一句话简介
- `description`: 详细描述
- `tags`: 标签数组
- `pros`: 优点数组
- `cons`: 缺点数组
- `scenarios`: 推荐场景数组
- `alternatives`: 平替工具 slug 数组
- `officialUrl`: 官网链接
- `editorComment`: 编辑点评
- `abilities`: 核心能力数组
- `targetAudience`: 适合人群数组

### 场景数据（scenarios.json）
包含 8 个场景，每个场景包含：
- `slug`: 唯一标识
- `title`: 场景标题
- `description`: 场景描述
- `problem`: 问题说明
- `primaryTools`: 主推荐工具 slug 数组
- `alternativeTools`: 备选工具 slug 数组
- `targetAudience`: 适合人群数组
- `toolCount`: 推荐工具数量

## AI 推荐算法

简化的关键词匹配推荐逻辑：
1. 直接工具名匹配（如输入"ChatGPT"直接返回 ChatGPT）
2. 场景匹配（如输入"做 PPT"匹配到 PPT 场景，推荐 Gamma、Canva AI）
3. 兜底推荐（无匹配时返回热门工具）

## 运行项目

项目已配置好所有依赖，可直接运行。

## 设计规范

遵循设计稿中的规范：
- 页面主背景：`#F6F8FB`
- 内容卡片背景：`#FFFFFF`
- 首屏深色背景：`#0F172A`
- 主品牌色：`#3B82F6`（蓝色）
- 强调辅助色：`#14B8A6`（青色）
- 卡片圆角：16px-20px
- 按钮圆角：12px
- 输入框圆角：16px

## 响应式设计

- 桌面端：3 列网格（工具卡片）
- 平板端：2 列网格
- 移动端：1 列网格，导航折叠为汉堡菜单

## 注意事项

1. 本项目为演示 Demo，不包含真实后端
2. 所有 API 调用均为本地 mock
3. 筛选功能仅做 UI 展示，未实现真实逻辑
4. 官网链接为示例链接
5. 评分和评测内容为示例数据

## 未来扩展方向

- [ ] 接入真实 AI API（如 OpenAI）
- [ ] 添加用户登录和收藏功能
- [ ] 实现真实的筛选和排序
- [ ] 添加评论系统
- [ ] 接入 Supabase 实现数据持久化
- [ ] 添加工具对比功能
- [ ] 多语言支持

---

本项目完全基于前端实现，可直接部署到静态网站托管服务（如 Vercel、Netlify）。
