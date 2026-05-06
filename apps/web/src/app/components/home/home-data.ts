export const HOME_ENTRY_CARDS = [
  {
    href: "/search",
    eyebrow: "3 秒定位",
    title: "按任务找",
    body: "说一句你要做什么，先拆任务，再进场景。",
  },
  {
    href: "/deals",
    eyebrow: "薅羊毛",
    title: "看免费福利",
    body: "免费额度、折扣、国内可用，集中看。",
  },
  {
    href: "/tools?mode=search&page=1&page_size=24",
    eyebrow: "工具库",
    title: "逛工具库",
    body: "榜单、分类、筛选、测评和避坑。",
  },
] as const;

export const QUICK_TASKS = [
  {
    id: "paper",
    label: "论文快交了",
    href: "/scene/paper",
    title: "论文这件事，别一上来就让 AI 写全文",
    body: "更常见的问题是：格式乱、目录不对、图表编号没统一、参考文献不规范、老师批注没改完",
    next: "论文排版、论文润色、参考文献、答辩 PPT",
  },
  {
    id: "ppt",
    label: "PPT 没思路",
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
    label: "想做张图",
    href: "/scene/design",
    title: "做图前，先想清楚它要被谁看到",
    body: "海报、封面、配图、商品图和社媒图的判断标准不一样，尺寸、风格和文字密度都要先定下来",
    next: "海报设计、封面图、商品图、社媒配图",
  },
  {
    id: "code",
    label: "代码跑不通",
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
] as const;

export type QuickTask = (typeof QUICK_TASKS)[number];
