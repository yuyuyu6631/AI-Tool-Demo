# 星点评 PRD（V2 修正版）

> **修订说明**：本版本基于《星点评 PRD V2 融合版》评审结果修订。主要变更：
> 1. 重新划定 V2 范围，剔除与 V1/V1.5 的重叠，收敛 MVP；
> 2. 补齐数据字段类型、枚举、状态机、权限矩阵；
> 3. 新增异常场景、空状态、边界条件、接口清单；
> 4. 明确 Tool Stacks（官方 PGC）与用户合集（UGC）的功能边界与数据隔离；
> 5. 角色推荐策略、搜索规则、排序规则从"描述性语言"改为"可执行规则"。

---

## 1. 文档信息

| 项 | 内容 |
|---|---|
| 产品名称 | 星点评 |
| 产品定位 | AI 工具发现、组合与上手使用平台 |
| 文档版本 | V2 修正版（基于 V2 融合版） |
| 目标读者 | 产品、研发、测试、设计、运营 |
| 开发周期（建议） | V2 范围按 6 周排期，详见 §13 |
| 基线依赖 | V1、V1.5 已上线（详见 §13） |

---

## 2. 产品背景与问题定义

### 2.1 核心问题

1. **找不到**：AI 工具分散在各处，缺少中文用户友好的统一入口。
2. **不会选**：分类多、信息杂，普通用户不知道该从哪个维度筛。
3. **不会用**：找到工具后，不知道用什么 Prompt、怎么组合其他工具解决完整任务。
4. **冷启动差**：新用户首次进入无个性化引导，跳出率高。

### 2.2 与 V1 的差异

V1 解决了 1、2 两个问题（导航 + 搜索）。V2 的增量价值在于解决 3、4——即"从发现到用好"。

---

## 3. 产品目标与成功指标

### 3.1 V2 核心目标

| 目标 | 量化指标（上线后 4 周内衡量） |
|---|---|
| 降低新用户跳出率 | 首次访问用户次日留存 ≥ 25% |
| 提升工具点击转化 | 角色推荐版块 CTR ≥ 默认热门列表 CTR × 1.5 |
| 提升上手成功率 | 工具详情页 Prompt 复制率 ≥ 8%（复制数 / PV） |
| 激活 UGC | 登录用户中合集创建率 ≥ 5% |

### 3.2 非目标（本期不追求）

- 不追求推荐算法精度，V2 使用规则映射即可。
- 不追求 Prompt 的海量覆盖，优先覆盖 Top 20 工具。
- 不追求移动端完整适配，仅保证 PC Web 可用。

---

## 4. 目标用户与角色定义

### 4.1 用户分层

| 角色 | 权限 | 典型动作 |
|---|---|---|
| 游客（未登录） | 浏览、搜索、查看公开合集、复制 Prompt | 发现工具 |
| 登录用户 | 游客权限 + 收藏、评论、创建合集、设置角色偏好 | 组合与沉淀工具 |
| 运营管理员 | 登录用户权限 + 后台 CRUD、评论/Prompt 审核、Stack 配置 | 维护内容生态 |
| 超级管理员 | 全部权限 + 用户管理、角色权限分配 | 系统运维 |

### 4.2 预设 Persona（6 个，V2 固定不做用户自选扩展）

1. 程序员 / 独立开发者
2. 学术科研 / 研究生
3. 内容创作者 / 自媒体
4. 职场办公 / 文员
5. 设计师 / 品牌视觉
6. 电商运营 / 增长营销

> 每个 Persona 后台预配置 10-20 个推荐工具，运营可随时调整。

---

## 5. 产品范围（V2 严格边界）

### 5.1 V2 本期必做（MVP）

| 模块 | 说明 | 预估工作量 |
|---|---|---|
| M1. 角色冷启动推荐 | 弹窗引导 + 首页角色专属版块 | 小 |
| M2. Tool Stacks（官方场景包） | 只做浏览，不做 UGC 创建 | 中 |
| M3. 工具详情页 Prompt 区块 | 后台录入 + 前台展示 + 一键复制 | 小 |
| M4. 后台新增页面 | 角色配置、Stacks 配置、Prompt 管理 | 中 |

### 5.2 V2 本期简化做（降级版）

| 模块 | 简化方式 |
|---|---|
| 用户自定义合集（UGC） | **仅做创建 + 查看 + 分享链接**，不做"公开广场"、不做合集评论、不做转发计数 |

### 5.3 V2.5 或以后再做

- 用户提交 Prompt / 工具（带审核流）
- 合集的点赞、评论、转发、广场
- 多角色多选
- 推荐算法（从规则映射升级为协同过滤）
- 移动端适配
- 数据分析后台

### 5.4 明确不做

- 支付、会员体系
- 私信、关注、粉丝
- 多语言
- 企业级多级审核

> **范围冻结规则**：本文档通过评审后，5.1-5.3 范围不得在未走变更流程的情况下调整。任何"顺手加一下"的需求一律入 V2.5 池。

---

## 6. 信息架构

### 6.1 前台页面清单

| 路径 | 页面 | 权限 | V 版本 |
|---|---|---|---|
| `/` | 首页 | 游客 | V1（V2 增强） |
| `/tools` | 工具列表页 | 游客 | V1 |
| `/tools/[slug]` | 工具详情页 | 游客 | V1（V2 增强 Prompt 区块） |
| `/stacks` | Tool Stacks 列表页 | 游客 | **V2 新增** |
| `/stacks/[slug]` | Tool Stack 详情页 | 游客 | **V2 新增** |
| `/collections/[share_token]` | 用户合集分享页 | 游客可见公开合集 | **V2 新增** |
| `/me` | 个人中心 | 登录 | V1.5（V2 增强合集 Tab） |
| `/me/collections/[id]/edit` | 合集编辑页 | 登录且为创建者 | **V2 新增** |
| `/login` | 登录页 | 游客 | V1.5 |
| `/register` | 注册页 | 游客 | V1.5 |

### 6.2 后台页面清单

| 路径 | 页面 | 权限 | V 版本 |
|---|---|---|---|
| `/admin` | 后台首页 | 管理员 | V1 |
| `/admin/tools` | 工具管理 | 管理员 | V1 |
| `/admin/categories` | 分类管理 | 管理员 | V1 |
| `/admin/tags` | 标签管理 | 管理员 | V1 |
| `/admin/reviews` | 评论管理 | 管理员 | V1 |
| `/admin/roles` | 角色推荐配置 | 管理员 | **V2 新增** |
| `/admin/stacks` | Tool Stacks 管理 | 管理员 | **V2 新增** |
| `/admin/prompts` | Prompt 管理 | 管理员 | **V2 新增** |

> 原 V1 PRD 中的 `/admin/topics`（专题管理）在本次 V2 暂不启用，避免与 Stacks 功能重复。

---

## 7. 功能需求

## 7.1 模块 M1：基于 Persona 的冷启动推荐

### 7.1.1 用户故事

作为一名新访客，我希望首次进入平台时快速选择我的身份，以便直接看到与我工作相关的工具。

### 7.1.2 触发规则

| 条件 | 触发行为 |
|---|---|
| 用户未登录 且 LocalStorage 无 `selectedPersona` | 进入首页后延迟 800ms 弹出引导 |
| 用户已登录 且 `users.selected_persona IS NULL` | 进入首页后延迟 800ms 弹出引导 |
| 已选过角色（任一存储位置命中） | **不弹窗** |
| 用户点击弹窗「暂时跳过」 | 当前会话内不再弹出，下次访问仍会触发 |

### 7.1.3 角色选择引导页

- **形式**：居中弹窗，宽度 640px，带半透明遮罩。
- **内容**：
  - 标题："欢迎来到星点评"
  - 副标题："选择你的身份，我们为你推荐最合适的 AI 工具"
  - 6 个角色卡片（2 行 × 3 列），每张卡片含图标 + 角色名 + 一句话描述
  - 底部"暂时跳过"文字按钮
- **交互**：
  - 单选，点击即高亮
  - 点击后 300ms 自动关闭弹窗
  - 关闭后首页顶部角色推荐版块立即渲染（无需刷新）

### 7.1.4 推荐版块规则

| 规则项 | 取值 |
|---|---|
| 版块位置 | 首页搜索框下方，默认热门工具列表上方 |
| 版块标题 | `专为{persona_name}推荐的 AI 工具` |
| 展示数量 | 默认 8 个，"查看更多"跳转 `/tools?persona={slug}` |
| 排序规则 | 按 `role_tool_mappings.sort_order` 升序，后备按 `tools.hot_score` 降序 |
| 数据来源 | 后台 `/admin/roles` 配置的 `role_tool_mappings` 表 |
| 空数据兜底 | 若该角色未配置工具，隐藏版块但不影响其他区域渲染；后台需触发告警 |
| 工具下架影响 | 推荐版块过滤 `tools.status != 'published'` 的工具 |

### 7.1.5 数据存储

| 场景 | 存储位置 | Key/字段 | 有效期 |
|---|---|---|---|
| 未登录 | LocalStorage | `selectedPersona` | 永久（用户清除浏览器数据除外） |
| 已登录 | 数据库 `users.selected_persona` | - | 永久 |
| 登录时合并 | 登录时若 LocalStorage 有值且 DB 无值，写回 DB 并清 LocalStorage | - | - |

### 7.1.6 修改角色入口

- 个人中心 → 账户设置 → "我的身份"
- 首页角色推荐版块右上角"切换身份"链接（下拉选择）

### 7.1.7 验收标准

| 编号 | 场景 | 预期结果 |
|---|---|---|
| AC-M1-01 | 新访客首次进入首页 | 800ms 后弹出引导 |
| AC-M1-02 | 已选角色后刷新 | 不再弹窗，首页有推荐版块 |
| AC-M1-03 | 未登录选完角色后登录 | 角色偏好同步到账户 |
| AC-M1-04 | 已登录用户切换角色 | 首页推荐版块立即更新 |
| AC-M1-05 | 角色配置工具数量为 0 | 版块隐藏，不报错 |
| AC-M1-06 | 弹窗"暂时跳过" | 本次会话内不再弹 |
| AC-M1-07 | 推荐版块中的工具被管理员下架 | 该工具从版块消失（缓存最长 5 分钟） |

---

## 7.2 模块 M2：Tool Stacks（官方场景工作流）

### 7.2.1 用户故事

作为一名有完整任务需求的用户（比如"写一篇论文"），我希望看到解决整个任务的工具组合，而不是只看到单个工具。

### 7.2.2 功能边界

**V2 仅做官方 PGC**，不做用户创建 Stack。用户创建类需求由"用户合集"（M5）承接。两者区别如下：

| 维度 | Tool Stacks（M2） | 用户合集（M5） |
|---|---|---|
| 创建者 | 运营 | 登录用户 |
| 结构 | 有序步骤 Step + 每步工具 + 步骤说明 | 扁平工具列表 + 可选备注 |
| 展示场景 | 强调"流程" | 强调"清单" |
| 是否分享链接 | 是（永久公开） | 是（创建者控制 public/private） |
| 审核 | 无需，运营直接发布 | V2 无审核，V2.5 引入 |

### 7.2.3 列表页 `/stacks`

- 卡片流展示所有 `status='published'` 的 Stack
- 卡片内容：封面图 / 标题 / 简介 / 适用人群标签 / 步骤数
- 排序：按 `stacks.sort_order` 升序，后备按 `created_at` 降序
- 筛选：按 Persona 筛选（对应 `persona_slug`）

### 7.2.4 详情页 `/stacks/[slug]`

结构：

1. **顶部**：标题、简介、适用人群、预计耗时、工具总数
2. **步骤区**：竖向流水线式排版
   - 每个 Step 展示：Step 序号 / Step 标题 / Step 描述 / 该步推荐工具卡片（1-N 个）/ "为什么这样组合"说明
   - 工具卡片点击跳转 `/tools/[slug]`
3. **底部**：相关 Stack 推荐（同 persona 下的其他 Stack，最多 3 个）

### 7.2.5 后台配置 `/admin/stacks`

- 列表：stack 列表 + 状态 + 步骤数 + 创建时间 + 操作（编辑/上下架/删除）
- 编辑页能力：
  - 基础信息：标题 / slug / 简介 / persona_slug / 封面图
  - 步骤增删：新增 Step、删除 Step、拖拽排序
  - 每个 Step 内：编辑标题、描述；选择 1-N 个工具；为每个工具填写 reason
  - 状态：draft / published / archived
- 校验：published 状态必须至少有 1 个 Step，每个 Step 至少 1 个工具

### 7.2.6 空状态与异常

| 场景 | 处理 |
|---|---|
| 列表页无数据 | "场景工作流正在建设中，敬请期待" |
| 详情页访问 draft 状态 | 404（管理员预览除外） |
| Stack 中某工具被删除 | 详情页跳过该工具，不报错；后台列表高亮提醒 |

### 7.2.7 验收标准

| 编号 | 场景 | 预期结果 |
|---|---|---|
| AC-M2-01 | 游客访问 `/stacks` | 看到所有已发布 Stack |
| AC-M2-02 | 按 Persona 筛选 | 仅显示匹配 persona 的 Stack |
| AC-M2-03 | 访问 draft Stack URL | 返回 404 |
| AC-M2-04 | Stack 中工具被下架 | 详情页过滤该工具，页面仍能正常渲染 |
| AC-M2-05 | 后台保存没有 Step 的已发布 Stack | 提示"至少需要 1 个步骤" |

---

## 7.3 模块 M3：工具详情页 Prompt 区块

### 7.3.1 用户故事

作为一名查看工具详情的用户，我希望直接看到高质量 Prompt 模板，并能一键复制。

### 7.3.2 功能说明

- 工具详情页在"评论区"上方新增「优质 Prompt」区块
- 每个工具最多展示 10 条 Prompt，按 `updated_at` 降序排列
- V2 仅支持管理员后台录入，不开放用户提交

### 7.3.3 Prompt 卡片结构

| 字段 | 展示位置 | 必填 |
|---|---|---|
| 标题 | 卡片顶部 | 是 |
| 场景标签 | 标题右侧 | 否 |
| Prompt 正文 | 卡片主体（支持 Markdown 渲染） | 是 |
| 变量占位符 | 正文中高亮（格式 `{变量名}`） | 否 |
| 创建者 / 更新时间 | 卡片底部 | 是 |
| 一键复制按钮 | 卡片右上角 | 是 |

### 7.3.4 复制交互

- 点击「复制」调用 `navigator.clipboard.writeText(body)`
- 复制成功：按钮文案变「已复制」，2 秒后还原；同时上报复制事件（用于统计 CTR）
- 复制失败（权限被拒）：Toast 提示"请手动复制"，弹出选中态的 Prompt 正文

### 7.3.5 后台管理 `/admin/prompts`

- 列表：按工具分组，展示标题 / 状态 / 创建时间 / 操作
- 编辑页字段对应 §8.14 `prompts` 表
- 状态：draft / published / archived
- 可设置 `sort_order` 控制同工具下的排序

### 7.3.6 空状态

| 场景 | 处理 |
|---|---|
| 工具无已发布 Prompt | 整个区块不展示（而非显示"收集中"空壳） |

### 7.3.7 验收标准

| 编号 | 场景 | 预期结果 |
|---|---|---|
| AC-M3-01 | 工具有 3 条 published Prompt | 详情页展示 3 条 |
| AC-M3-02 | 点击复制 | Toast 提示 + 按钮文案切换 + 剪贴板有完整 Prompt |
| AC-M3-03 | 浏览器禁用剪贴板权限 | 降级为手动复制引导 |
| AC-M3-04 | 工具无 Prompt | 区块完全隐藏 |
| AC-M3-05 | 后台下架某 Prompt | 前台 5 分钟内消失（缓存窗口） |

---

## 7.4 模块 M4：后台新增页面

### 7.4.1 `/admin/roles`（角色推荐配置）

- 左侧：6 个 Persona 列表（固定，V2 不支持增删）
- 右侧：选中 Persona 后展示其推荐工具列表
  - 支持从工具库搜索并添加
  - 支持拖拽调整顺序（对应 `sort_order`）
  - 每项可填写 `reason`（展示在前端工具卡片副标题，选填）
  - 支持移除

### 7.4.2 `/admin/stacks`

详见 §7.2.5。

### 7.4.3 `/admin/prompts`

详见 §7.3.5。

### 7.4.4 权限要求

- 仅管理员可访问 `/admin/*`
- 接口层需验证管理员身份（JWT + role 字段）
- 非管理员访问返回 403

---

## 7.5 模块 M5：用户合集（UGC，降级版）

### 7.5.1 V2 范围（严格限定）

| 能力 | V2 是否做 |
|---|---|
| 登录用户创建/编辑/删除合集 | 做 |
| 合集内添加/移除/排序工具 | 做 |
| 合集公开/私有切换 | 做 |
| 分享链接（含唯一 token） | 做 |
| 个人中心列出"我的合集" | 做 |
| 合集评论 / 点赞 / 转发 | **不做** |
| 合集广场 / 发现页 | **不做** |
| 合集举报 | **不做** |

### 7.5.2 创建与编辑

- 入口 1：个人中心 → "我的合集" → "新建合集"
- 入口 2：工具详情页 → "加入合集"（弹出选择框，可新建或追加到已有合集）
- 编辑页 `/me/collections/[id]/edit`：
  - 标题（必填，≤ 50 字）
  - 描述（选填，≤ 500 字）
  - 可见性：public / private
  - 工具列表：添加、移除、拖拽排序
  - 每个工具可附 note（选填，≤ 200 字）

### 7.5.3 分享链接规则

- 每个合集创建时生成唯一 `share_token`（16 位随机字符串）
- 分享 URL：`/collections/{share_token}`
- **仅 public 合集** 可通过分享链接访问；private 合集访问返回 404（不暴露存在性）
- 游客可访问 public 合集

### 7.5.4 展示页 `/collections/[share_token]`

- 顶部：合集标题、描述、创建者昵称、更新时间、工具数
- 主体：工具卡片列表，按 `collection_tools.sort_order` 排序，每个卡片含工具基础信息 + 创建者 note
- 底部：游客看到"登录后创建你的合集"引导

### 7.5.5 边界场景

| 场景 | 处理 |
|---|---|
| 合集内工具被下架 | 卡片显示"工具暂不可用"灰态，不跳转 |
| 合集被创建者删除 | 分享链接访问返回 404 |
| 从 public 切回 private | 已分享链接立即失效 |
| 同一工具加入同一合集两次 | 幂等，只记录一次 |
| 单个合集工具数上限 | 50 个，超出提示"最多 50 个" |
| 单用户合集数上限 | 20 个 |

### 7.5.6 验收标准

| 编号 | 场景 | 预期结果 |
|---|---|---|
| AC-M5-01 | 未登录用户点击"加入合集" | 引导登录 |
| AC-M5-02 | 创建 public 合集 + 分享链接 | 游客可访问 |
| AC-M5-03 | 创建者删除合集 | 分享链接返回 404 |
| AC-M5-04 | 尝试访问他人 private 合集 | 404（不是 403） |
| AC-M5-05 | 合集内添加 51 个工具 | 第 51 个被拒绝 |
| AC-M5-06 | 将 public 改为 private | 分享链接立即 404 |

---

## 8. 数据模型（完整字段定义）

> 约定：`id` 统一为 BIGINT 自增主键；`created_at`/`updated_at` 为 TIMESTAMP；`status` 为枚举 VARCHAR；布尔字段用 TINYINT(1)。

### 8.1 tools

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | BIGINT | PK | |
| slug | VARCHAR(64) | UNIQUE, NOT NULL | URL 友好标识 |
| name | VARCHAR(128) | NOT NULL | |
| tagline | VARCHAR(200) | | 一句话介绍 |
| description | TEXT | | 长描述，支持 Markdown |
| official_url | VARCHAR(500) | NOT NULL | |
| category_id | BIGINT | FK | |
| pricing_type | ENUM | | free / freemium / paid |
| pricing_label | VARCHAR(50) | | 展示用，如"免费起"|
| hot_score | INT | DEFAULT 0 | 热度分（定时任务计算） |
| rating | DECIMAL(2,1) | DEFAULT 0 | 评分均值，0-5 |
| review_count | INT | DEFAULT 0 | |
| status | ENUM | | draft / published / archived |
| featured | TINYINT(1) | DEFAULT 0 | 是否首页精选 |
| created_at | TIMESTAMP | | |
| updated_at | TIMESTAMP | | |

### 8.2 categories

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| slug | VARCHAR(64) UNIQUE | |
| name | VARCHAR(64) | |
| description | VARCHAR(200) | |
| sort_order | INT DEFAULT 0 | |

### 8.3 tags

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| slug | VARCHAR(64) UNIQUE | |
| name | VARCHAR(64) | |

### 8.4 tool_tags（工具-标签关联表）

| 字段 | 类型 | 说明 |
|---|---|---|
| tool_id | BIGINT FK | |
| tag_id | BIGINT FK | |
| 联合主键 | (tool_id, tag_id) | |

### 8.5 users

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| nickname | VARCHAR(50) NOT NULL | |
| email | VARCHAR(100) UNIQUE NOT NULL | |
| password_hash | VARCHAR(200) NOT NULL | bcrypt |
| avatar | VARCHAR(500) | |
| selected_persona | VARCHAR(64) | 对应 roles.slug，可空 |
| role | ENUM | user / admin / superadmin |
| status | ENUM | active / disabled |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 8.6 favorites

| 字段 | 类型 | 说明 |
|---|---|---|
| user_id | BIGINT FK | |
| tool_id | BIGINT FK | |
| created_at | TIMESTAMP | |
| 联合主键 | (user_id, tool_id) | |

### 8.7 reviews

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT FK | |
| tool_id | BIGINT FK | |
| rating | TINYINT | 1-5 |
| title | VARCHAR(100) | 选填 |
| content | TEXT | |
| status | ENUM | pending / published / rejected |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| 唯一约束 | (user_id, tool_id) | 一用户一工具一评 |

### 8.8 roles

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| slug | VARCHAR(64) UNIQUE | 如 `developer` |
| name | VARCHAR(64) | 如 `程序员 / 独立开发者` |
| description | VARCHAR(200) | |
| icon_url | VARCHAR(500) | |
| sort_order | INT DEFAULT 0 | |

### 8.9 role_tool_mappings

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| role_id | BIGINT FK | |
| tool_id | BIGINT FK | |
| reason | VARCHAR(100) | 推荐理由（选填） |
| sort_order | INT DEFAULT 0 | |
| 唯一约束 | (role_id, tool_id) | |

### 8.10 stacks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| slug | VARCHAR(64) UNIQUE | |
| title | VARCHAR(100) | |
| summary | VARCHAR(200) | |
| description | TEXT | |
| persona_slug | VARCHAR(64) | 对应 roles.slug |
| cover_url | VARCHAR(500) | |
| estimated_duration | VARCHAR(50) | 如 "30 分钟" |
| creator_type | ENUM | official（V2 固定） |
| creator_id | BIGINT | 管理员 user_id |
| status | ENUM | draft / published / archived |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 8.11 stack_steps

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| stack_id | BIGINT FK | |
| step_order | INT | |
| title | VARCHAR(100) | |
| description | TEXT | |

### 8.12 stack_step_tools

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| step_id | BIGINT FK | |
| tool_id | BIGINT FK | |
| reason | VARCHAR(200) | "为什么这样组合"说明 |
| sort_order | INT DEFAULT 0 | |

### 8.13 collections

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| title | VARCHAR(50) | |
| description | VARCHAR(500) | |
| creator_id | BIGINT FK | users.id |
| visibility | ENUM | public / private |
| share_token | VARCHAR(32) UNIQUE | 随机生成 |
| status | ENUM | active / deleted（软删） |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 8.14 collection_tools

| 字段 | 类型 | 说明 |
|---|---|---|
| collection_id | BIGINT FK | |
| tool_id | BIGINT FK | |
| sort_order | INT DEFAULT 0 | |
| note | VARCHAR(200) | |
| 联合主键 | (collection_id, tool_id) | |

### 8.15 prompts

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| tool_id | BIGINT FK | |
| title | VARCHAR(100) | |
| scenario_tag | VARCHAR(50) | 场景标签，选填 |
| body | TEXT | Prompt 正文 |
| variables | JSON | 变量名列表，如 `["竞品名称", "行业"]` |
| creator_id | BIGINT FK | users.id（管理员） |
| source_type | ENUM | official（V2 固定） |
| status | ENUM | draft / published / archived |
| sort_order | INT DEFAULT 0 | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 8.16 事件日志 events（简版埋点，可选）

用于统计 Prompt 复制、角色推荐 CTR 等指标。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | BIGINT PK | |
| event_type | VARCHAR(50) | prompt_copy / role_recommendation_click / stack_view |
| user_id | BIGINT | 可空（游客） |
| target_id | BIGINT | 目标对象 id |
| extra | JSON | |
| created_at | TIMESTAMP | |

---

## 9. 状态流转

### 9.1 工具状态机（tools.status）

```
draft ──发布──▶ published ──归档──▶ archived
  ▲                │
  └─────撤回───────┘
```

### 9.2 评论状态机（reviews.status）

```
pending ──审核通过──▶ published
   │
   └──审核拒绝──▶ rejected
```

> V2 默认评论"先发后审"即创建时为 published，后续可切为"先审后发"（配置项控制）。

### 9.3 Prompt / Stack 状态机

同工具状态机。

### 9.4 合集可见性切换

```
private ◀────公开/私有切换──── public
```

私有化切换后：`share_token` 保留但对外不可访问。

---

## 10. 关键用户流程

### 10.1 新用户冷启动

```
进入首页
  ↓
检查 LocalStorage.selectedPersona / users.selected_persona
  ├── 已有 → 渲染角色推荐版块
  └── 无 → 800ms 后弹出引导
         ↓
      用户选择 / 跳过
         ↓
      写入存储 → 渲染推荐版块
```

### 10.2 合集分享流程

```
登录用户创建合集 → 添加工具 → 设为 public
  ↓
后端生成 share_token
  ↓
用户复制分享链接 → 分享到外部
  ↓
游客打开链接 → 查看合集（可跳转工具详情）
  ↓
游客点击"创建自己的合集" → 引导登录
```

其他流程详见各模块的验收表。

---

## 11. 接口清单（V2 新增部分）

> 完整接口待技术方案评审时细化，以下为关键接口。命名约定：RESTful + JSON。

### 11.1 角色推荐

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/roles` | 公开 | 获取所有 Persona 列表 |
| GET | `/api/roles/{slug}/tools` | 公开 | 获取某 Persona 的推荐工具 |
| PATCH | `/api/me/persona` | 登录 | 更新当前用户角色偏好 |
| POST | `/api/admin/roles/{id}/tools` | 管理员 | 配置推荐工具 |
| DELETE | `/api/admin/roles/{id}/tools/{tool_id}` | 管理员 | 移除推荐工具 |

### 11.2 Stacks

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/stacks?persona=xxx` | 公开 | 列表（仅 published） |
| GET | `/api/stacks/{slug}` | 公开 | 详情（含 steps + tools） |
| POST | `/api/admin/stacks` | 管理员 | 创建 |
| PUT | `/api/admin/stacks/{id}` | 管理员 | 更新（含步骤） |
| DELETE | `/api/admin/stacks/{id}` | 管理员 | 删除 |

### 11.3 Prompts

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/tools/{slug}/prompts` | 公开 | 某工具的 published Prompt |
| POST | `/api/events/prompt-copy` | 公开 | 埋点上报（无需鉴权） |
| POST | `/api/admin/prompts` | 管理员 | 创建 |
| PUT | `/api/admin/prompts/{id}` | 管理员 | 更新 |

### 11.4 合集

| 方法 | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/me/collections` | 登录 | 我的合集列表 |
| POST | `/api/me/collections` | 登录 | 新建 |
| PUT | `/api/me/collections/{id}` | 登录且创建者 | 编辑 |
| DELETE | `/api/me/collections/{id}` | 登录且创建者 | 软删 |
| POST | `/api/me/collections/{id}/tools` | 登录且创建者 | 添加工具 |
| DELETE | `/api/me/collections/{id}/tools/{tool_id}` | 登录且创建者 | 移除工具 |
| GET | `/api/collections/share/{token}` | 公开 | 通过分享链接访问 public 合集 |

---

## 12. 权限矩阵

| 资源 / 操作 | 游客 | 登录用户 | 管理员 | 超管 |
|---|---|---|---|---|
| 浏览工具/列表/详情 | ✓ | ✓ | ✓ | ✓ |
| 搜索/筛选/排序 | ✓ | ✓ | ✓ | ✓ |
| 收藏工具 | ✗ | ✓ | ✓ | ✓ |
| 发表评论 | ✗ | ✓ | ✓ | ✓ |
| 复制 Prompt | ✓ | ✓ | ✓ | ✓ |
| 查看 public 合集 | ✓ | ✓ | ✓ | ✓ |
| 查看 private 合集 | ✗ | ✗（仅创建者） | ✗（仅创建者） | ✓ |
| 创建/编辑/删除自己的合集 | ✗ | ✓ | ✓ | ✓ |
| 设置角色偏好 | ✓（本地） | ✓（账户） | ✓ | ✓ |
| 后台 CRUD | ✗ | ✗ | ✓ | ✓ |
| 管理用户 | ✗ | ✗ | ✗ | ✓ |

---

## 13. 版本规划与里程碑

### 13.1 基线（已上线）

- **V1**：工具目录、搜索筛选、详情页、后台工具/分类/标签 CRUD
- **V1.5**：登录注册、真实收藏、评论、个人中心

### 13.2 V2 本期（6 周排期示例）

| 周次 | 里程碑 |
|---|---|
| W1 | 技术方案评审、数据库 schema 落地、后台框架搭建 |
| W2 | M1 角色推荐（前后台）、M4 后台角色配置页 |
| W3 | M2 Stacks 前台（列表 + 详情）、M4 后台 Stacks 管理 |
| W4 | M3 Prompt 区块（前台）、M4 后台 Prompt 管理、埋点 |
| W5 | M5 用户合集（创建/编辑/分享） |
| W6 | 联调、测试、回归、灰度上线 |

### 13.3 V2.5 候选池

- 用户提交 Prompt（含审核）
- 用户提交工具（含审核）
- 合集广场 + 点赞 + 评论
- 推荐算法（协同过滤）
- 数据分析后台
- 移动端适配

### 13.4 变更规则

- V2 范围冻结后，任何新增需求默认进 V2.5 候选池
- 确需插入 V2 的，需重新评审并明确砍掉同等工作量的其他需求

---

## 14. 非功能需求

### 14.1 性能

| 指标 | 目标 |
|---|---|
| 首页首屏加载（4G 网络） | ≤ 2.5 秒 |
| 工具列表页分页 | 每页 24 条，懒加载 |
| 角色推荐数据缓存 | 服务端缓存 5 分钟 |
| Prompt 数据缓存 | 服务端缓存 5 分钟 |
| Stack 详情缓存 | 服务端缓存 10 分钟 |

### 14.2 可用性

- 所有交互动作（收藏、复制、登录跳转）必须有反馈（Toast 或按钮态）
- 空状态必须有文案，不出现纯白空白
- 错误状态必须有 retry 入口

### 14.3 兼容性

- PC Web：Chrome 最近两版、Edge 最近两版、Safari 最近两版
- 移动端：保证可访问不破版，交互体验不做优化（V2.5 专项优化）
- 最小分辨率：1280 × 720

### 14.4 数据安全

- 密码 bcrypt 存储
- 管理后台接口 JWT + role 双重校验
- 用户只能操作自己的合集（后端强制校验 creator_id）
- private 合集访问返回 404 而非 403，避免暴露存在性
- XSS 防护：所有用户输入（评论、合集描述、Prompt）前端渲染时 escape

### 14.5 可维护性

- 核心配置（推荐工具、Stack、Prompt）通过后台可视化维护，不依赖改代码
- 错误日志上报（Sentry 或同等）

---

## 15. 测试要点

### 15.1 按模块测试重心

| 模块 | 重点测试场景 |
|---|---|
| M1 角色推荐 | 弹窗触发条件、推荐版块排序、登录态合并、空数据兜底 |
| M2 Stacks | 状态机（draft/published/archived）、工具被下架的降级、权限 |
| M3 Prompt | 复制成功/失败降级、空状态、后台下架同步 |
| M5 合集 | 公开/私有切换、分享链接、上限校验、越权操作 |

### 15.2 全局回归要点

- 所有页面的未登录/登录态切换
- 后台数据变更到前台生效的缓存窗口
- 角色切换后全站推荐数据刷新

### 15.3 兼容性测试

- 3 种浏览器 × 2 种分辨率 = 6 组合组合主链路回归

---

## 16. 风险登记

| 风险 | 等级 | 缓解措施 |
|---|---|---|
| 角色推荐配置工作量大，冷启动无数据 | 高 | W1 起产品 + 运营并行配置，M1 上线前需覆盖全部 6 个 Persona |
| Stacks 内容生产慢 | 中 | V2 上线要求至少 6 个已发布 Stack（每 Persona 1 个） |
| Prompt 质量参差 | 中 | 上线前至少覆盖 Top 20 工具，每工具 3 条 |
| 合集分享链接泄露隐私 | 低 | V2 合集不含个人敏感信息；private 与 public 严格隔离 |
| 缓存失效导致前后台数据不一致 | 中 | 缓存 TTL 控制在 5-10 分钟，管理员操作主动失效关键 key |

---

## 17. 一句话总结

星点评 V2 在 V1 导航能力基础上，通过**角色冷启动推荐**解决新用户"不知道搜什么"、通过**官方 Tool Stacks** 解决"只看到单点工具"、通过**Prompt 区块** 解决"找到工具不会用"、通过**用户合集**开启 UGC 沉淀——本期严格聚焦这四件事，其余需求一律入 V2.5 候选池。

---

## 附录 A：原 PRD 评审问题与本版处理对照

| 原 PRD 问题 | 本版处理 |
|---|---|
| 标题 V2 但范围含 V1/V1.5 | §5 严格划定 V2 边界；§6 页面表标注版本归属 |
| MVP 膨胀 | §5.1-5.3 三级收敛；§5.2 合集功能降级 |
| 字段类型/枚举缺失 | §8 全部补齐类型、约束、枚举 |
| 权限体系缺失 | §12 新增权限矩阵 |
| 异常场景缺失 | 每个模块新增"边界场景"小节 |
| 状态机缺失 | §9 集中描述 |
| 角色推荐规则模糊 | §7.1.4 表格化规则 |
| Stacks 与用户合集边界模糊 | §7.2.2 功能边界对比表 |
| 接口清单缺失 | §11 |
| 验收标准颗粒度粗 | 每个模块用 AC-Mx-xx 编号逐条验收 |
| 版本规划自相矛盾 | §13 明确基线 + 本期 + 候选池 |
| Prompt 变量字段未定义 | §8.15 明确为 JSON 数组 |
| 合集工具上限未定义 | §7.5.5 50 个/合集，20 个/用户 |
