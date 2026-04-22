import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  LayoutGrid,
  Workflow,
  Bookmark,
  UserRound,
  Settings,
  Command,
  Star,
  ExternalLink,
  ChevronRight,
  Plus,
  Copy,
  Filter,
  Flame,
  Clock3,
  Code2,
  PenTool,
  BriefcaseBusiness,
  GraduationCap,
  ShoppingBag,
  Palette,
  X,
  Check,
} from "lucide-react";

const personas = [
  { key: "developer", name: "程序员", icon: Code2, desc: "代码、调试、自动化", tone: "适合代码开发、接口调试、自动化测试、项目落地" },
  { key: "research", name: "学术科研", icon: GraduationCap, desc: "论文、阅读、资料整理", tone: "适合论文写作、文献检索、资料总结、引用整理" },
  { key: "creator", name: "内容创作", icon: PenTool, desc: "选题、脚本、图文", tone: "适合选题策划、脚本撰写、图文生成、内容分发" },
  { key: "office", name: "职场办公", icon: BriefcaseBusiness, desc: "文档、表格、汇报", tone: "适合日报周报、PPT、表格分析、会议纪要" },
  { key: "design", name: "设计视觉", icon: Palette, desc: "海报、品牌、图片", tone: "适合视觉生成、海报设计、品牌素材、图片处理" },
  { key: "ecommerce", name: "电商运营", icon: ShoppingBag, desc: "商品、投放、增长", tone: "适合商品文案、店铺运营、投放素材、数据复盘" },
];

const tools = [
  { name: "ChatGPT", tag: "AI 助手", desc: "适合问答、写作、分析和任务拆解", score: "4.9", hot: true, price: "免费增值", personas: ["developer", "research", "creator", "office", "ecommerce"] },
  { name: "Claude", tag: "长文写作", desc: "适合长文本处理、代码审查和文档分析", score: "4.8", hot: true, price: "免费增值", personas: ["developer", "research", "office"] },
  { name: "Cursor", tag: "AI 编程", desc: "面向开发者的智能代码编辑器", score: "4.7", hot: false, price: "免费试用", personas: ["developer"] },
  { name: "Gamma", tag: "AI PPT", desc: "快速生成演示文稿和页面内容", score: "4.6", hot: false, price: "免费增值", personas: ["office", "research", "creator"] },
  { name: "Midjourney", tag: "AI 绘图", desc: "高质量图像生成与视觉探索", score: "4.7", hot: true, price: "付费", personas: ["design", "creator", "ecommerce"] },
  { name: "Perplexity", tag: "AI 搜索", desc: "适合资料检索、引用追踪和信息总结", score: "4.6", hot: false, price: "免费增值", personas: ["research", "office", "developer"] },
  { name: "Notion AI", tag: "知识管理", desc: "笔记、文档、项目资料整理", score: "4.5", hot: false, price: "付费", personas: ["office", "research", "creator"] },
  { name: "Canva AI", tag: "设计办公", desc: "轻量设计、海报、社媒图制作", score: "4.4", hot: false, price: "免费增值", personas: ["design", "office", "ecommerce", "creator"] },
  { name: "Runway", tag: "AI 视频", desc: "适合生成视频、短片素材和动态视觉", score: "4.5", hot: false, price: "免费试用", personas: ["creator", "design", "ecommerce"] },
  { name: "Jasper", tag: "营销文案", desc: "适合广告文案、商品描述和增长内容", score: "4.3", hot: false, price: "付费", personas: ["ecommerce", "creator"] },
  { name: "v0", tag: "前端生成", desc: "通过提示词快速生成页面与组件原型", score: "4.5", hot: false, price: "免费增值", personas: ["developer", "design"] },
  { name: "DeepL Write", tag: "英文润色", desc: "适合英文表达优化、论文和商务写作", score: "4.4", hot: false, price: "免费增值", personas: ["research", "office"] },
];

const stacks = [
  { title: "写一篇论文初稿", steps: 5, persona: "学术科研", tools: "ChatGPT + Perplexity + Notion" },
  { title: "开发一个落地页", steps: 4, persona: "程序员", tools: "Cursor + ChatGPT + v0" },
  { title: "做一套产品宣发图", steps: 4, persona: "设计视觉", tools: "Midjourney + Canva + Gamma" },
];

const categories = ["全部", "AI 写作", "AI 编程", "AI 设计", "AI 办公", "AI 搜索", "AI 视频", "AI PPT"];

const promptTemplateCategories = ["全部", "AI 写作", "AI 编程", "AI 设计", "AI 办公", "AI 搜索"];

const promptTemplates = [
  {
    category: "AI 写作",
    title: "生成一篇结构清楚的文章初稿",
    desc: "适合写文章、方案、说明文、课程作业初稿。",
    body: "请围绕【主题】写一篇文章初稿，要求结构清楚、表达自然，包含标题、引言、正文分段和结尾总结。语气保持【正式/通俗/专业】，字数控制在【字数】左右。",
  },
  {
    category: "AI 写作",
    title: "降低文本机器感并润色",
    desc: "适合论文、报告、方案文本的自然化处理。",
    body: "请在不改变原意的前提下，润色下面这段文字。要求减少模板化表达，句子长短自然变化，保留关键信息，不新增无法确认的数据。原文如下：【粘贴文本】",
  },
  {
    category: "AI 编程",
    title: "让 AI 直接修改现有代码",
    desc: "适合 Cursor、Claude Code、Codex 这类编程工具。",
    body: "请阅读当前代码结构，直接完成【功能/问题】的修改。要求：不重构无关文件，不改动业务文案，不删除现有功能；修改后说明涉及文件、核心改动和需要我验证的地方。",
  },
  {
    category: "AI 编程",
    title: "生成测试用例与边界场景",
    desc: "适合接口测试、功能测试、验收测试。",
    body: "请根据下面的需求说明，生成测试用例。需要覆盖正常流程、异常输入、权限校验、空状态、边界值和回归风险。输出字段包括：用例标题、前置条件、测试步骤、预期结果、优先级。需求如下：【粘贴需求】",
  },
  {
    category: "AI 设计",
    title: "优化一个页面的视觉层级",
    desc: "适合 UI 页面审查、前端界面优化。",
    body: "请从信息层级、间距、对齐、色彩、卡片密度、交互反馈六个角度，评估这个页面的问题，并给出可直接交给前端修改的建议。页面说明/截图如下：【粘贴内容】",
  },
  {
    category: "AI 办公",
    title: "整理会议纪要和待办",
    desc: "适合会议录音转写、聊天记录整理。",
    body: "请把下面的会议内容整理成会议纪要。输出包括：会议主题、关键结论、争议点、待办事项、负责人、截止时间、风险提醒。原始内容如下：【粘贴内容】",
  },
  {
    category: "AI 搜索",
    title: "做一次可靠的信息检索",
    desc: "适合查资料、竞品调研、选型分析。",
    body: "请围绕【问题】进行信息检索和总结。要求优先使用权威来源，区分事实、观点和推测；最后给出结论、依据、可能的不确定点，以及后续还需要确认的信息。",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ToolCard({ tool, compact = false }) {
  return (
    <article className="group rounded-[26px] border border-white/80 bg-white/74 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-semibold text-white shadow-lg shadow-slate-300/40">
            {tool.name.slice(0, 1)}
          </div>
          <div>
            <h3 className="font-semibold tracking-tight">{tool.name}</h3>
            <div className="mt-1 text-xs text-slate-500">{tool.tag}</div>
          </div>
        </div>
        {tool.hot && <span className="rounded-full bg-orange-50 px-2 py-1 text-[11px] font-medium text-orange-600">热门</span>}
      </div>
      <p className={cn("text-sm leading-6 text-slate-600", compact ? "min-h-[42px]" : "min-h-[44px]")}>{tool.desc}</p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
          <Star size={15} className="fill-current" /> {tool.score}
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{tool.price}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <button className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">详情</button>
        <button className="flex items-center justify-center gap-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-medium text-white">
          官网 <ExternalLink size={13} />
        </button>
      </div>
    </article>
  );
}

function PromptTemplateSection() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const visibleTemplates = activeCategory === "全部" ? promptTemplates : promptTemplates.filter((item) => item.category === activeCategory);

  return (
    <section className="rounded-[34px] border border-white/70 bg-white/58 p-5 shadow-[0_24px_80px_rgba(30,58,138,0.09)] backdrop-blur-2xl">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700">
            <Copy size={14} /> 详情页固定模块
          </div>
          <h2 className="text-xl font-semibold tracking-tight">常用 Prompt 模板</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            放在工具详情页评论区上方，按分类展示通用模板；没有单独录入 Prompt 的工具，也能先展示这些基础模板。
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
          管理模板 <ChevronRight size={16} />
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto rounded-[24px] bg-white/48 p-2">
        {promptTemplateCategories.map((item) => (
          <button
            key={item}
            onClick={() => setActiveCategory(item)}
            className={cn(
              "whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm transition",
              activeCategory === item ? "bg-slate-950 text-white shadow-lg shadow-slate-300/40" : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-950"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleTemplates.map((item) => (
          <article key={item.title} className="rounded-[26px] border border-white/80 bg-white/76 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-slate-200/70">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{item.category}</span>
                <h3 className="mt-3 text-base font-semibold leading-6 tracking-tight">{item.title}</h3>
              </div>
              <button className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/40">
                <Copy size={15} />
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-500">{item.desc}</p>
            <div className="mt-4 rounded-[20px] bg-slate-950 p-4 text-sm leading-6 text-slate-200">
              {item.body}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function XingdianpingSkeleton() {
  const [persona, setPersona] = useState("developer");
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  useEffect(() => {
    const storedPersona = typeof window !== "undefined" ? window.localStorage.getItem("selectedPersona") : null;
    const skipped = typeof window !== "undefined" ? window.sessionStorage.getItem("personaGuideSkipped") : null;

    if (storedPersona && personas.some((item) => item.key === storedPersona)) {
      setPersona(storedPersona);
      return;
    }

    if (!skipped) {
      const timer = window.setTimeout(() => setShowPersonaModal(true), 500);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const currentPersona = useMemo(() => personas.find((item) => item.key === persona), [persona]);
  const PersonaIcon = currentPersona?.icon || UserRound;
  const recommendedTools = useMemo(() => tools.filter((tool) => tool.personas.includes(persona)).slice(0, 8), [persona]);

  function selectPersona(key) {
    setPersona(key);
    setShowPersonaModal(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedPersona", key);
      window.sessionStorage.removeItem("personaGuideSkipped");
    }
  }

  function skipPersonaGuide() {
    setShowPersonaModal(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("personaGuideSkipped", "1");
    }
  }

  return (
    <div className="min-h-screen bg-[#edf3fb] text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute right-16 top-24 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      {showPersonaModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/28 p-4 backdrop-blur-xl">
          <div className="w-full max-w-[760px] rounded-[38px] border border-white/75 bg-white/82 p-5 shadow-[0_40px_120px_rgba(15,23,42,0.24)] backdrop-blur-2xl md:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <Sparkles size={14} /> 首次进入推荐
                </div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">先选一个身份</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  选择后首页会自动匹配推荐工具、Prompt 和场景工作流。后面也可以随时切换。
                </p>
              </div>
              <button onClick={skipPersonaGuide} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/90 text-slate-500 shadow-sm hover:text-slate-950">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {personas.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => selectPersona(item.key)}
                    className="group rounded-[26px] border border-white bg-white/72 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-950 hover:text-white hover:shadow-xl hover:shadow-slate-300/50"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-white/12 group-hover:text-white">
                        <Icon size={19} />
                      </div>
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-white/15 group-hover:text-white">
                        <Check size={15} />
                      </div>
                    </div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-500 group-hover:text-slate-300">{item.desc}</div>
                    <p className="mt-3 text-xs leading-5 text-slate-500 group-hover:text-slate-300">{item.tone}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[22px] bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
              <span>未登录时保存到本地；登录后可同步到账户偏好。</span>
              <button onClick={skipPersonaGuide} className="font-medium text-slate-700 hover:text-slate-950">暂时跳过</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative flex min-h-screen p-4">
        <aside className="hidden w-[268px] shrink-0 flex-col rounded-[32px] border border-white/70 bg-white/62 p-4 shadow-[0_24px_80px_rgba(30,58,138,0.10)] backdrop-blur-2xl lg:flex">
          <div className="mb-7 flex items-center gap-3 px-2 pt-1">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-400/30">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">星点评</div>
              <div className="text-xs text-slate-500">AI 工具发现工作台</div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { label: "工具目录", icon: LayoutGrid, active: true },
              { label: "场景工作流", icon: Workflow },
              { label: "我的合集", icon: Bookmark },
              { label: "个人中心", icon: UserRound },
              { label: "后台管理", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                    item.active ? "bg-slate-950 text-white shadow-lg shadow-slate-400/30" : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[26px] border border-white/70 bg-white/65 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <PersonaIcon size={17} />
              当前身份
            </div>
            <div className="text-lg font-semibold">{currentPersona?.name}</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{currentPersona?.tone}</p>
            <button onClick={() => setShowPersonaModal(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-3 py-2.5 text-sm text-white">
              切换身份 <ChevronRight size={16} />
            </button>
          </div>
        </aside>

        <main className="ml-0 flex-1 lg:ml-4">
          <header className="sticky top-4 z-10 mb-4 rounded-[30px] border border-white/70 bg-white/70 p-3 shadow-[0_18px_60px_rgba(30,58,138,0.08)] backdrop-blur-2xl">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 xl:w-[520px] xl:flex-none">
                  <Search size={19} className="text-slate-400" />
                  <input className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="搜索 AI 工具、场景、Prompt..." />
                  <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 sm:flex">
                    <Command size={13} /> G
                  </div>
                </div>
                <button className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200/80 bg-white/75 text-slate-600">
                  <Filter size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {categories.slice(0, 6).map((item, index) => (
                  <button key={item} className={cn("whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm transition", index === 0 ? "bg-slate-950 text-white" : "bg-white/70 text-slate-600 hover:bg-white")}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <section className="grid gap-4 xl:grid-cols-[1fr_330px]">
            <div className="space-y-4">
              <section className="rounded-[34px] border border-white/70 bg-white/58 p-5 shadow-[0_24px_80px_rgba(30,58,138,0.09)] backdrop-blur-2xl">
                <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700">
                      <Sparkles size={14} /> 已根据身份自动匹配
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">专为{currentPersona?.name}推荐的 AI 工具</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{currentPersona?.tone}。推荐结果由角色配置映射生成，不再把角色选择卡片堆在首页。</p>
                  </div>
                  <button onClick={() => setShowPersonaModal(true)} className="flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-slate-300/40">
                    重新选择身份 <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {recommendedTools.map((tool) => (
                    <ToolCard key={tool.name} tool={tool} compact />
                  ))}
                </div>
              </section>

              <section className="rounded-[34px] border border-white/70 bg-white/58 p-5 shadow-[0_24px_80px_rgba(30,58,138,0.09)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">热门工具</h2>
                    <p className="mt-1 text-sm text-slate-500">不受身份影响，展示平台整体高热度工具。</p>
                  </div>
                  <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
                    <Flame size={17} /> 按热度排序
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {tools.slice(0, 8).map((tool) => (
                    <ToolCard key={tool.name} tool={tool} />
                  ))}
                </div>
              </section>

              <PromptTemplateSection />

              <section className="grid gap-4 xl:grid-cols-3">
                {stacks.map((stack, index) => (
                  <article key={stack.title} className="rounded-[30px] border border-white/70 bg-white/60 p-5 shadow-[0_18px_60px_rgba(30,58,138,0.08)] backdrop-blur-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">{index + 1}</div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">{stack.persona}</span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight">{stack.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{stack.tools}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/80 pt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Workflow size={16} /> {stack.steps} 个步骤
                      </div>
                      <button className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">查看</button>
                    </div>
                  </article>
                ))}
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-[34px] border border-white/70 bg-white/62 p-5 shadow-[0_24px_80px_rgba(30,58,138,0.09)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">今日上手</h2>
                  <Clock3 size={18} className="text-slate-400" />
                </div>
                <div className="rounded-[24px] bg-slate-950 p-4 text-white shadow-xl shadow-slate-300/40">
                  <div className="mb-2 text-sm text-slate-300">Prompt 模板</div>
                  <div className="text-lg font-semibold">帮我评估一个 AI 工具是否适合团队使用</div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">从价格、功能、学习成本、协作能力和替代方案五个角度分析。</p>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950">
                    <Copy size={16} /> 复制 Prompt
                  </button>
                </div>
              </section>

              <section className="rounded-[34px] border border-white/70 bg-white/62 p-5 shadow-[0_24px_80px_rgba(30,58,138,0.09)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">最新收录</h2>
                  <button className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">全部</button>
                </div>
                <div className="space-y-3">
                  {["Lovable", "Manus", "Krea", "Trae"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-white/74 p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-sm font-semibold">{item[0]}</div>
                        <div>
                          <div className="text-sm font-medium">{item}</div>
                          <div className="text-xs text-slate-500">刚刚更新</div>
                        </div>
                      </div>
                      <Plus size={17} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[34px] border border-white/70 bg-white/62 p-5 shadow-[0_24px_80px_rgba(30,58,138,0.09)] backdrop-blur-2xl">
                <h2 className="text-lg font-semibold">分类浏览</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.slice(1).map((item) => (
                    <button key={item} className="rounded-2xl bg-white/80 px-3 py-2 text-sm text-slate-600 shadow-sm hover:bg-white">
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}
