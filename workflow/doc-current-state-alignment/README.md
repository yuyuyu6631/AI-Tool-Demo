# 文档现状对齐工作流

这是一个给 AI 使用的标准工作流，用于把仓库里的文档更新到“与当前代码一致”的状态。

适用场景：

- 代码实现已经偏离旧需求文档
- 团队希望保留当前实现效果，并同步更新文档
- 文档中混有“历史方案”“当前实现”“未来规划”，需要重新分层

本工作流的核心产出：

- 一组与当前代码一致的文档更新
- 一份明确区分“当前实现”和“未来规划”的文档口径
- 一次可复查的差异扫描与完成检查
- 一份由代码自动生成的当前实现基线：`docs/current-implementation-baseline.md`

## 自动化入口

- 手动刷新：`npm run docs:sync`
- 只做校验：`npm run docs:check`
- 默认情况下，`npm install` 会把 git hooks 指向仓库内 `.githooks/`
- 提交代码时，`pre-commit` 会先执行 `npm run docs:sync`，并把生成结果一并加入提交

如果本机不想自动安装 hooks，可在安装依赖前设置 `SKIP_GIT_HOOKS=1`。

建议执行顺序：

1. 先读 [WORKFLOW.md](./WORKFLOW.md)
2. 执行时对照 [CHECKLIST.md](./CHECKLIST.md)
3. 需要复用时直接使用 [PROMPT_TEMPLATE.md](./PROMPT_TEMPLATE.md)
4. 完成后按 [OUTPUT_TEMPLATE.md](./OUTPUT_TEMPLATE.md) 汇报
