# Xingdianping Bug 检查报告

**检查日期**: 2026-05-08
**检查方式**: 团队模式并行扫描（前端/后端/集成三线并行）
**总计发现**: 22个bug（高5 / 中10 / 低7）

---

## P0 - 必须立即修复

### BUG-01 [高] 首页 N+1 查询，单次请求触发 6-8 次全量数据库查询

- **文件**: `apps/api/app/services/catalog_service.py`
- **位置**: `get_home_catalog` (line 1219) 及其调用链
- **类型**: 性能
- **描述**: `get_home_catalog` 单次请求触发至少 4 次 `_load_searchable_tools` / `_load_summaries` 全量数据库查询（每次都是 `SELECT tools + selectinload tags + selectinload categories`）。`list_categories` 又独立加载一次，加上 `list_scenarios`、`list_rankings` 各自独立加载，首页一次请求可能触发 6-8 次全量工具表查询。
- **修复建议**: 在 `get_home_catalog` 中加载一次 `all_tools`，传入子函数复用，或在 service 层增加请求级缓存。
- **负责人**: \_\_\_

---

### BUG-02 [高] 推荐缓存无工具变更失效机制

- **文件**: `apps/api/app/services/recommendation_service.py:88-96`、`apps/api/app/services/cache_service.py:79-88`
- **类型**: 缓存一致性
- **描述**: `recommend()` 使用 Redis 缓存推荐结果，TTL 30 分钟。但管理员通过 admin 接口创建/更新/删除工具后，推荐缓存不会被清除。`clear_recommendation_caches()` 仅在 `publish_match_plan` 时被调用，工具 CRUD 操作中未调用。
- **后果**: 管理员更新工具信息后，用户在 30 分钟内仍会看到旧的推荐结果。
- **修复建议**: 在 `admin_service.upsert_tool` 和 `admin_service.delete_review` 完成后调用 `clear_recommendation_caches()`。
- **负责人**: \_\_\_

---

### BUG-03 [高] Chat 接口无认证保护

- **文件**: `apps/api/app/api/routes/chat.py:35`
- **类型**: 安全
- **描述**: `/api/chat` 端点没有任何认证依赖（无 `auth_service.current_user_dependency`），任何人可以无限制调用外部 AI API。
- **后果**: 恶意用户可以无限制消耗 AI API 额度。
- **修复建议**: 添加认证依赖，或至少添加速率限制。
- **负责人**: \_\_\_

---

### BUG-04 [高] HomeCatalogResponse 前后端字段名完全不匹配

- **后端**: `apps/api/app/schemas/catalog.py:71-76` — 字段: `hotTools`, `latestTools`, `sidebarCategories`, `categorySections`
- **前端**: `apps/web/src/app/lib/catalog-types.ts:255-261` — 字段: `featuredTools`, `latestTools`, `rankings`, `scenarios`, `categories`
- **类型**: 前后端合约
- **描述**: 后端 `/api/home` 返回的字段名与前端类型定义完全不一致。当前 `fetchHomeCatalog()` 未被调用所以未暴露，但 API 和类型都是"活代码"。
- **修复建议**: 统一字段命名，建议以后端 schema 为准更新前端类型。
- **负责人**: \_\_\_

---

### BUG-05 [高] /matches 页面使用 mock 数据

- **文件**: `apps/web/app/matches/page.tsx:6`
- **类型**: 架构违规
- **描述**: 页面直接 import `mockProfiles` from `@/src/app/features/matches/mock-data`，将假数据渲染到生产页面中。违反项目"不要将假数据重新引入活动运行时路径"的规则。
- **修复建议**: 如功能未上线，用占位页面或重定向替代；如已上线，接入真实 API。
- **负责人**: \_\_\_

---

## P1 - 尽快修复

### BUG-06 [中] 推荐候选加载全量评论数据但未使用

- **文件**: `apps/api/app/services/candidate_selector.py:6`
- **类型**: 性能
- **描述**: `select_candidates` 调用 `list_tools_raw(db=db)` 加载所有工具的全部评论数据，但仅使用 `slug`、`tags`、`category`、`summary` 字段做过滤。评论数据完全未被使用。
- **修复建议**: 使用 `_load_summaries` 替代 `list_tools_raw`，或新建不加载 reviews 的查询函数。
- **负责人**: \_\_\_

---

### BUG-07 [中] match_plan 发布状态被静默降级

- **文件**: `apps/api/app/services/match_plan_service.py:164`
- **类型**: API 设计
- **描述**: 当通过 `PUT /api/admin/match-plans/{plan_id}` 传入 `status: "published"` 时，状态会被静默降级为 `"draft"`，不返回任何错误或提示。
- **修复建议**: 要么返回 422 错误明确拒绝，要么在响应中包含 warning 字段说明。
- **负责人**: \_\_\_

---

### BUG-08 [中] ToolRatingSummary 前端多了不存在的字段

- **文件**: `apps/web/src/app/lib/catalog-types.ts:220-226`
- **类型**: 类型不一致
- **描述**: 前端 `ToolRatingSummary` 有 `count` 和 `distribution` 字段，但后端从不发送这两个字段。API 返回时这两个值为 `undefined`。开发时 fallback 数据掩盖了问题。
- **修复建议**: 移除前端多余的 `count`/`distribution` 字段，或让后端一并返回。
- **负责人**: \_\_\_

---

### BUG-09 [中] packages/contracts 共享合约包完全未使用

- **文件**: `packages/contracts/src/index.ts`
- **类型**: 死代码 / 架构
- **描述**: `@xingdianping/contracts` 包未被 frontend 或 backend 引用，无 package.json 依赖它。前端使用自己的 `catalog-types.ts`。合约已与实际使用 diverged（如 `ScenarioSummary.primaryTools` 类型不一致）。
- **修复建议**: 要么正式引入并维护，要么删除避免误导。
- **负责人**: \_\_\_

---

### BUG-10 [中] 聊天组件使用数组索引作为 React key

- **文件**: `apps/web/src/app/components/ChatBot.tsx:323`、`apps/web/src/app/components/chat/InlineChatBot.tsx:45`
- **类型**: React key 错误
- **描述**: 两个聊天组件渲染 messages 列表时使用 `key={idx}`。在 SSE 流式场景下，assistant 消息内容会原地更新，使用索引作为 key 会导致 React 复用旧 DOM 节点，可能造成消息内容错位。
- **对比**: `FloatingChatBot.tsx:237` 使用了正确的 key: `key={\`${msg.role}-${idx}\`}`
- **修复建议**: 使用 `${msg.role}-${idx}` 或引入唯一 ID。
- **负责人**: \_\_\_

---

### BUG-11 [中] ToolReviewsPanel setTimeout 未清理导致内存泄漏

- **文件**: `apps/web/src/app/components/ToolReviewsPanel.tsx:105`
- **类型**: 内存泄漏
- **描述**: `handleSubmit` 中 `setTimeout(() => setMessage(null), 3000)` 的 timeout ID 没有被存储，组件卸载时也没有清理。用户在 3 秒内离开页面会导致对已卸载组件的状态更新。
- **修复建议**: 使用 useRef 存储 timeout ID，并在 useEffect cleanup 中 clearTimeout。
- **负责人**: \_\_\_

---

### BUG-12 [中] FloatingChatBot resize 事件导致不必要的状态更新

- **文件**: `apps/web/src/app/components/chat/FloatingChatBot.tsx:79-91`
- **类型**: 性能
- **描述**: resize 事件监听器中 `keepInsideViewport` 在每次 resize 时都调用 `setPosition()` 和 `localStorage.setItem()`，即使位置没有变化也会触发不必要的重渲染。
- **修复建议**: 在设置新位置前检查是否与当前位置相同，不同才更新。
- **负责人**: \_\_\_

---

### BUG-13 [中] AdminAccessGate 非管理员短暂看到中间态页面

- **文件**: `apps/web/src/app/components/admin/AdminAccessGate.tsx:19-23`
- **类型**: UX
- **描述**: guest 用户访问管理页面时，会先看到一个中间态页面然后被重定向，体验不佳。
- **修复建议**: 在 loading 状态下直接判断并重定向，避免渲染 children。
- **负责人**: \_\_\_

---

### BUG-14 [中] HeroToolRadar useEffect 依赖自身状态导致动画频繁重启

- **文件**: `apps/web/src/app/components/HeroToolRadar.tsx:82`
- **类型**: React useEffect 依赖项
- **描述**: useEffect 依赖数组包含 `state.phase` 和 `state.query`，但这些值在 effect 内部通过 `setState` 更新，形成 "setState -> re-render -> effect re-run -> setState" 循环。
- **修复建议**: 使用 ref 追踪 state 值，或重构为 useReducer。
- **负责人**: \_\_\_

---

## P2 - 有空再修

### BUG-15 [低] 推荐函数缺少 Session 类型注解

- **文件**: `apps/api/app/services/recommendation_service.py:38`
- **描述**: `db` 参数缺少 `Session` 类型注解，项目中其他所有 service 函数都正确标注了。
- **负责人**: \_\_\_

---

### BUG-16 [低] \_repair_text 对合法中文字符做无效编码尝试

- **文件**: `apps/api/app/services/catalog_service.py:159-170`
- **描述**: `suspicious_markers` 包含 "忙"、"莽"、"茅"、"茂" 等合法常用汉字，会对包含这些字的文本做无效的 latin1 编码尝试。
- **修复建议**: 使用更精确的 mojibake 检测模式。
- **负责人**: \_\_\_

---

### BUG-17 [低] revoke_session 可能泄露数据库异常信息

- **文件**: `apps/api/app/services/auth_service.py:277-282`
- **描述**: `revoke_session` 中 `db.commit()` 失败时直接抛出 SQLAlchemyError，日志中可能包含敏感的数据库信息。
- **修复建议**: 将异常包装为 `HTTPException(500)`。
- **负责人**: \_\_\_

---

### BUG-18 [低] 评论排序字段不一致

- **文件**: `catalog_service.py:311-314` 按 `created_at` 排序；`review_service.py:67` 按 `updated_at` 排序
- **描述**: 工具详情页通过不同入口获取的评论顺序可能不同。
- **负责人**: \_\_\_

---

### BUG-19 [低] ChatBot.tsx 是死代码

- **文件**: `apps/web/src/app/components/ChatBot.tsx`
- **描述**: 与 FloatingChatBot 大量重复，layout.tsx 只使用 FloatingChatBot。
- **修复建议**: 删除 ChatBot.tsx。
- **负责人**: \_\_\_

---

### BUG-20 [低] ToolReviewsResponse 有未使用的 items 字段

- **文件**: `apps/web/src/app/lib/catalog-types.ts:241-246`
- **描述**: 前端类型有 `items` 字段，但后端返回 `editorReviews`/`userReviews`，无 `items`。
- **负责人**: \_\_\_

---

### BUG-21 [低] CategorySummary 前端缺少 description/toolCount 字段

- **文件**: `apps/web/src/app/lib/catalog-types.ts:248-253`
- **描述**: 前端类型缺少后端发送的 `description` 和 `toolCount` 字段。
- **负责人**: \_\_\_

---

### BUG-22 [低] AdminReviewListItem 字段不完整

- **文件**: `apps/web/src/app/lib/catalog-types.ts:366-373`
- **描述**: 前端类型缺少后端发送的 `toolId`、`status`、`rating`、`createdAt`、`updatedAt` 字段。
- **负责人**: \_\_\_

---

## 统计

| 优先级 | 数量 | 分布                      |
| ------ | ---- | ------------------------- |
| P0     | 5    | 后端2 / 前端2 / 集成1     |
| P1     | 9    | 后端2 / 前端4 / 集成3     |
| P2     | 8    | 后端3 / 前端1 / 集成3 + 1 |
