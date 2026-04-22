# 星点评（Xingdianping）

AI 工具发现、评测与对比平台（Monorepo）。

## 当前重点

当前仓库正在准备一轮前端布局大改，优先目标不是继续堆功能，而是先把整站页面结构、入口逻辑和文档口径统一。

这轮改动前，建议先阅读以下文档：

- [布局改版工作台](./doc/15-布局改版工作台.md)
- [页面设计规范](./doc/03-页面设计规范.md)
- [前端落地设计说明](./doc/10-前端设计稿.md)
- [一期统一入口测试说明](./docs/phase1-testing-handoff.md)

## 当前产品能力

- 首页统一主入口，承接 `直接搜索` / `AI 帮找`
- 工具目录页支持搜索、筛选、排序、分页
- 工具详情页支持基础信息、标签、评分、相似工具推荐
- 榜单页、场景页、认证页已具备可运行骨架
- AI 搜索链路已接入 `/api/ai-search`，支持基础意图理解和降级

## 技术栈

- 前端：Next.js 15、React 19、TypeScript、Tailwind CSS 4、Vitest、Playwright
- 后端：FastAPI、SQLAlchemy、Alembic、Pytest
- 基础设施：MySQL、Redis、Docker Compose

## 项目结构

```text
apps/
  api/                FastAPI 服务与测试
  web/                Next.js 前端与测试
packages/
  contracts/          前后端共享类型
doc/                  产品、页面、交互与技术文档
docs/                 阶段性交接、测试与专项说明
scripts/              根目录脚本
infra/                本地基础设施配置
```

## 本地启动

1. 安装依赖

```bash
npm install
cd apps/api
pip install -e .[dev]
```

2. 配置环境变量

- 复制 `.env.example` 为 `.env`
- 配置数据库、Redis 与模型相关环境变量

3. 启动服务

```bash
npm start
```

## 常用命令

```bash
npm run dev:web
npm run build:web
npm run lint:web
npm run test:web
npm run docs:sync
npm run docs:check
npm run stop
```

后端：

```bash
cd apps/api
alembic upgrade head
python -m pytest
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 协作约定

- 当前以仓库代码为唯一事实来源
- 页面布局、信息架构和交互口径以 `doc/` 下文档为准
- 阶段性交接、测试范围和灰度说明以 `docs/` 下文档为准
- 若文档与代码不一致，先以代码为准，再回写文档
- 本轮布局大改期间，优先维护入口文档和页面结构文档的一致性
- `docs/current-implementation-baseline.md` 由代码自动生成，提交前会通过 `pre-commit` 自动刷新
- 若只想校验生成结果是否过期，运行 `npm run docs:check`
