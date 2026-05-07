export const HOME_ENTRY_CARDS = [
  {
    href: "/scenarios",
    eyebrow: "问题实测",
    title: "看本周实测",
    body: "真实任务、统一输入、横向表现和最终建议先看清。",
  },
  {
    href: "/deals",
    eyebrow: "薅羊毛",
    title: "看免费福利",
    body: "免费额度、折扣、国内可用和季节活动集中看。",
  },
  {
    href: "/tools?mode=search&page=1&page_size=24",
    eyebrow: "工具库",
    title: "逛工具库",
    body: "按名称、分类、功能或场景继续筛，结合实测判断。",
  },
] as const;

export const QUICK_TASKS = [
  {
    id: "paper",
    label: "论文改文",
    href: "/scene/paper",
    title: "论文这件事，别一上来就让 AI 写全文",
    body: "更常见的问题是：格式乱、目录不对、图表编号没统一、参考文献不规范、老师批注没改完",
    next: "论文排版、论文润色、参考文献、答辩 PPT",
  },
  {
    id: "ppt",
    label: "PPT 润思路",
    href: "/scene/ppt",
    title: "PPT 做不出来，问题不一定是缺模板",
    body: "你可能缺的是：大纲、页面结构、配图、排版、演讲稿",
    next: "答辩 PPT、课程展示、商业汇报、产品介绍",
  },
  {
    id: "data",
    label: "表格看不懂",
    href: "/scene/data",
    title: "表格问题一般不是单纯丢给 AI 就完事",
    body: "先看你要做的是：清洗数据、做图表、写分析结论、提取重点、自动生成报告",
    next: "Excel 分析、数据可视化、自动报表",
  },
  {
    id: "design",
    label: "想做长图",
    href: "/scene/design",
    title: "做图前，先想清楚它要被谁看到",
    body: "海报、封面、配图、商品图和社媒图的判断标准不一样，尺寸、风格和文字密度都要先定下来",
    next: "海报设计、封面图、商品图、社媒配图",
  },
  {
    id: "code",
    label: "代码快速修复",
    href: "/scene/code",
    title: "代码问题先别急着整段重写",
    body: "更稳的做法是先定位报错、复现步骤、依赖版本和最近改动，再决定是解释、补测试还是改实现",
    next: "报错排查、代码解释、单元测试、重构建议",
  },
  {
    id: "video",
    label: "视频来不及剪",
    href: "/scene/video",
    title: "赶视频时，先把交付版本定清楚",
    body: "你可能需要的是：提取字幕、压缩时长、找高光片段、补封面、配音或改成竖屏版本",
    next: "字幕提取、短视频剪辑、封面图、配音文案",
  },
  {
    id: "resume",
    label: "简历优化",
    href: "/scene/resume",
    title: "简历优化不是把形容词堆得更满",
    body: "先确认岗位、经历证据、成果量化和筛选系统，再决定让 AI 改结构、改措辞还是补案例。",
    next: "岗位匹配、经历梳理、成果量化、面试话术",
  },
  {
    id: "report",
    label: "报告生成",
    href: "/scene/report",
    title: "报告生成先看信息来源够不够干净",
    body: "更重要的是资料整理、结构提纲、引用核验和结论边界，而不是让 AI 一次写完。",
    next: "资料整理、报告大纲、结论提炼、引用核验",
  },
] as const;

export type QuickTask = (typeof QUICK_TASKS)[number];
