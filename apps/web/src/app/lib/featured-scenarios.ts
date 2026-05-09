export interface FeaturedScenarioStep {
  title: string;
  body: string;
}

export interface FeaturedScenario {
  slug: string;
  title: string;
  description: string;
  problem: string;
  targetAudience: string[];
  searchQuery: string;
  workflow: FeaturedScenarioStep[];
}

export const FEATURED_SCENARIOS: FeaturedScenario[] = [
  {
    slug: "make-ppt",
    title: "PPT 制作榜 TOP5",
    description: "适合销售汇报、课程展示和答辩初稿，先看生成完整度、模板质量和改稿成本。",
    problem: "临时做汇报时，最耗时的不是找工具，而是把大纲、页面结构、视觉风格和讲述节奏串成一份能交付的演示稿。",
    targetAudience: ["产品经理", "销售", "学生答辩", "创业团队"],
    searchQuery: "做 PPT 用什么 AI",
    workflow: [
      { title: "梳理汇报目标", body: "先写清楚听众、时长、结论和必须出现的数据，避免 AI 直接生成一份泛泛的模板。" },
      { title: "生成完整初稿", body: "用 PPT 生成类工具先产出结构完整的演示稿，重点看页序、标题和信息层级是否成立。" },
      { title: "统一模板与表达", body: "再人工统一学校或公司模板、配色、字体和每页的表达节奏，删掉重复或空泛内容。" },
      { title: "核验图表和结论", body: "所有自动生成的数据、引用和图表都要回到原始材料核对，避免答辩或汇报时被问住。" },
    ],
  },
  {
    slug: "paper-format",
    title: "AI 写作工具榜 TOP5",
    description: "适合文章润色、论文格式检查和长文改写，先看表达质量、引用风险和格式能力。",
    problem: "论文内容完成后，格式问题往往分散在标题层级、目录、页眉页脚、图表编号和参考文献里，人工逐项检查很容易漏。",
    targetAudience: ["毕业生", "研究生", "高校教师", "论文辅导"],
    searchQuery: "论文排版 格式 检查",
    workflow: [
      { title: "拆出格式清单", body: "把学校模板或格式规范拆成检查项：标题层级、目录、页码、页眉页脚、图表编号和参考文献。" },
      { title: "让 AI 先做结构检查", body: "上传或粘贴目录与正文片段，让 AI 标出层级不一致、编号缺失和格式风险。" },
      { title: "逐项修正文档", body: "在 Word 或排版工具里按清单修正样式，不要只复制 AI 给出的结果，避免引入新格式。" },
      { title: "最终人工复核", body: "打印预览或导出 PDF 后检查目录跳转、分页、参考文献和图表说明，确保提交版一致。" },
    ],
  },
  {
    slug: "excel-analysis",
    title: "数据分析工具榜 TOP5",
    description: "适合运营报表、Excel 分析和业务复盘，先看字段理解、公式生成和图表核验路径。",
    problem: "Excel 分析的难点通常不是生成公式，而是理解字段含义、判断口径、发现异常值，并把结论转成可复核的图表和说明。",
    targetAudience: ["运营", "分析师", "产品经理", "业务负责人"],
    searchQuery: "分析 Excel 数据 公式 图表",
    workflow: [
      { title: "识别字段和口径", body: "先让 AI 解释每列可能代表什么、哪些字段能做维度、哪些字段适合作为指标。" },
      { title: "生成公式和透视思路", body: "根据目标让 AI 给出公式、透视表字段摆放和分组方式，再在 Excel 里实际验证。" },
      { title: "做图表与异常检查", body: "优先生成趋势、占比、TopN 和异常值检查，不只看平均值，避免被极端值误导。" },
      { title: "保留核验路径", body: "把每个结论对应的数据范围、筛选条件和公式写清楚，方便同事或客户复核。" },
    ],
  },
  {
    slug: "coding-debug",
    title: "开发工具榜 TOP5",
    description: "适合代码生成、报错定位和测试补全，先看项目上下文理解、改动可控性和代码质量。",
    problem: "开发提效的关键不是让 AI 随便写代码，而是让它读懂项目上下文、定位真实报错，并给出能验证、能回滚的改动。",
    targetAudience: ["前端开发", "后端开发", "测试工程师", "技术负责人"],
    searchQuery: "代码生成 报错修复 测试用例",
    workflow: [
      { title: "描述项目和报错", body: "提供框架、运行命令、错误堆栈和相关文件范围，让 AI 先定位问题而不是直接改全局。" },
      { title: "生成最小修复", body: "优先要求 AI 给出最小可验证改动，避免一次性重构太多模块。" },
      { title: "补充测试用例", body: "让 AI 根据修复点补单元测试或回归场景，确认旧路径没有被破坏。" },
      { title: "人工审查差异", body: "合并前检查依赖、类型、边界条件和安全风险，关键逻辑仍需开发者复核。" },
    ],
  },
];

export function getFeaturedScenario(slug: string) {
  return FEATURED_SCENARIOS.find((scenario) => scenario.slug === slug) ?? null;
}
