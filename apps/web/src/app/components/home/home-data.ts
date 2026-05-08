export const HOME_ENTRY_CARDS = [
  {
    href: "/scenarios",
    title: "看本周实测",
    lightBody: "同一个任务丢给多个 AI，谁真的能用，一眼看出来",
    darkBody: "真实任务、多个 AI 同台，谁行谁不行，数据说话",
  },
  {
    href: "/deals",
    title: "看免费福利",
    lightBody: "每天更新，哪些现在免费可用、哪些有坑，我们帮你盯着",
    darkBody: "哪些今天免费、哪些有额度、哪些国内能用，每天盯着给你更新",
  },
  {
    href: "/tools?mode=search&page=1&page_size=24",
    title: "逛工具库",
    lightBody: "按你要做的事找，不用自己一个个试",
    darkBody: "按你要做的事找工具，不用自己一个个踩坑",
  },
] as const;

export const QUICK_TASKS = [
  {
    id: "paper",
    label: "论文润色",
    query: "帮我润色论文",
    href: "/tools?mode=ai&q=%E5%B8%AE%E6%88%91%E6%B6%A6%E8%89%B2%E8%AE%BA%E6%96%87&page=1&page_size=24",
  },
  {
    id: "ppt",
    label: "PPT 出框架",
    darkLabel: "PPT 框架",
    query: "帮我出一份 PPT 框架",
    href: "/tools?mode=ai&q=%E5%B8%AE%E6%88%91%E5%87%BA%E4%B8%80%E4%BB%BD%20PPT%20%E6%A1%86%E6%9E%B6&page=1&page_size=24",
  },
  {
    id: "data",
    label: "表格读不懂",
    query: "帮我看懂这张表格",
    href: "/tools?mode=ai&q=%E5%B8%AE%E6%88%91%E7%9C%8B%E6%87%82%E8%BF%99%E5%BC%A0%E8%A1%A8%E6%A0%BC&page=1&page_size=24",
  },
  {
    id: "code",
    label: "代码跑不通",
    darkLabel: "代码报错",
    query: "帮我定位代码报错",
    href: "/tools?mode=ai&q=%E5%B8%AE%E6%88%91%E5%AE%9A%E4%BD%8D%E4%BB%A3%E7%A0%81%E6%8A%A5%E9%94%99&page=1&page_size=24",
  },
  {
    id: "report",
    label: "长文提炼",
    query: "帮我提炼这篇长文",
    href: "/tools?mode=ai&q=%E5%B8%AE%E6%88%91%E6%8F%90%E7%82%BC%E8%BF%99%E7%AF%87%E9%95%BF%E6%96%87&page=1&page_size=24",
  },
] as const;

export type QuickTask = (typeof QUICK_TASKS)[number];
