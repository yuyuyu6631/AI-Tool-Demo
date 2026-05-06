export interface TaskScene {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  warning: string;
  searchQuery: string;
  next: string[];
  steps: Array<{ title: string; body: string }>;
}

export const TASK_SCENES: TaskScene[] = [
  {
    slug: "paper",
    title: "论文快交了",
    shortTitle: "论文",
    description: "先处理格式、目录、图表编号、参考文献和老师批注，再决定要不要用 AI 润色。",
    warning: "论文这件事，别一上来就让 AI 写全文。最容易出问题的通常是格式和提交规范。",
    searchQuery: "论文排版 格式 检查 参考文献",
    next: ["论文排版", "论文润色", "参考文献", "答辩 PPT"],
    steps: [
      { title: "先列提交规范", body: "把学校模板、标题层级、页码、目录、页眉页脚和参考文献要求列成清单。" },
      { title: "再检查结构问题", body: "让 AI 帮你找目录不一致、编号缺失、图表说明不统一和批注遗漏。" },
      { title: "最后回到文档修正", body: "不要直接复制 AI 输出，按清单在 Word 或排版工具里逐项修。" },
    ],
  },
  {
    slug: "ppt",
    title: "PPT 没思路",
    shortTitle: "PPT",
    description: "先定听众、时长、结论和页面结构，再看生成工具、模板和演讲稿。",
    warning: "PPT 做不出来，问题不一定是缺模板。你可能缺的是大纲、页面结构、配图、排版和讲稿。",
    searchQuery: "答辩 PPT 大纲 页面结构 演讲稿",
    next: ["答辩 PPT", "课程展示", "商业汇报", "产品介绍"],
    steps: [
      { title: "确认汇报目标", body: "先写清楚听众是谁、讲多久、最后希望对方记住什么。" },
      { title: "拆页面结构", body: "把内容拆成封面、问题、方法、结果、结论和 Q&A，不要先找模板。" },
      { title: "再生成和统一", body: "用工具生成初稿后，人工统一模板、配色、字号和讲述节奏。" },
    ],
  },
  {
    slug: "data",
    title: "表格看不懂",
    shortTitle: "表格",
    description: "先判断字段、口径、异常值和目标结论，再生成公式、图表和报告。",
    warning: "表格问题一般不是单纯丢给 AI 就完事。先看你要清洗、分析、画图还是写结论。",
    searchQuery: "Excel 数据分析 清洗 图表 报告",
    next: ["Excel 分析", "数据可视化", "自动报表"],
    steps: [
      { title: "识别字段口径", body: "先解释每列含义，找出维度、指标、缺失值和异常值。" },
      { title: "生成分析路径", body: "再让 AI 给公式、透视表、图表类型和结论结构。" },
      { title: "保留复核路径", body: "每个结论都要能回到数据范围、筛选条件和公式。" },
    ],
  },
  {
    slug: "design",
    title: "想做张图",
    shortTitle: "图片",
    description: "先确定用途、尺寸、风格和文字密度，再找作图、修图或排版工具。",
    warning: "做图前先想清楚它要被谁看到。海报、封面、商品图和社媒图不是一个标准。",
    searchQuery: "AI 图片 海报 封面 商品图 设计",
    next: ["海报设计", "封面图", "商品图", "社媒配图"],
    steps: [
      { title: "明确投放位置", body: "先定小红书、公众号、PPT、商品页还是朋友圈，尺寸和信息密度不同。" },
      { title: "拆视觉元素", body: "列出主体、文字、背景、风格和必须出现的品牌信息。" },
      { title: "再生成版本", body: "先批量出方向，再人工选一版修细节和文字可读性。" },
    ],
  },
  {
    slug: "code",
    title: "代码跑不通",
    shortTitle: "代码",
    description: "先定位报错、复现步骤、依赖版本和最近改动，再决定解释、补测试或修代码。",
    warning: "代码问题先别急着整段重写。最重要的是缩小问题范围和保存可复现上下文。",
    searchQuery: "AI 编程 报错排查 单元测试 代码解释",
    next: ["报错排查", "代码解释", "单元测试", "重构建议"],
    steps: [
      { title: "固定复现条件", body: "保存报错、命令、输入数据、依赖版本和最近改动。" },
      { title: "拆出最小问题", body: "让 AI 帮你判断是环境、数据、逻辑还是接口契约问题。" },
      { title: "补测试再修", body: "先写能复现问题的测试或脚本，再让工具辅助修改。" },
    ],
  },
  {
    slug: "video",
    title: "视频来不及剪",
    shortTitle: "视频",
    description: "先定交付版本、时长、平台和素材状态，再处理字幕、高光、封面和配音。",
    warning: "赶视频时先把交付版本定清楚。长视频、短视频、竖屏和课程切片的工具选择不同。",
    searchQuery: "AI 视频剪辑 字幕 高光 封面 配音",
    next: ["字幕提取", "短视频剪辑", "封面图", "配音文案"],
    steps: [
      { title: "确认交付格式", body: "先定横屏还是竖屏、时长、平台、字幕和封面要求。" },
      { title: "拆素材处理", body: "把任务分成转写、找高光、剪辑、配音、封面和压缩。" },
      { title: "最后人工校对", body: "AI 能省剪辑时间，但字幕、人名、品牌名和节奏要人工确认。" },
    ],
  },
];

export function getTaskScene(slug: string) {
  return TASK_SCENES.find((scene) => scene.slug === slug) ?? null;
}

export function inferTaskScenes(task: string) {
  const normalized = task.toLowerCase();
  const matched = TASK_SCENES.filter((scene) =>
    [scene.title, scene.shortTitle, scene.searchQuery, ...scene.next].some((item) => normalized.includes(item.toLowerCase())),
  );
  if (matched.length > 0) return matched.slice(0, 3);

  if (/ppt|答辩|汇报|演示/.test(normalized)) return [getTaskScene("ppt")!];
  if (/论文|文献|排版|毕业/.test(normalized)) return [getTaskScene("paper")!];
  if (/excel|表格|数据|报表/.test(normalized)) return [getTaskScene("data")!];
  if (/图|海报|封面|设计|图片/.test(normalized)) return [getTaskScene("design")!];
  if (/代码|报错|bug|测试|接口/.test(normalized)) return [getTaskScene("code")!];
  if (/视频|剪辑|字幕|配音/.test(normalized)) return [getTaskScene("video")!];

  return TASK_SCENES.slice(0, 3);
}
