import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/30 bg-white/40 py-10 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">关于星点评</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            星点评是一个 AI 工具点评与发现平台，围绕任务、成本、访问条件和可信度，帮助用户更快做出选择。
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">使用说明</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            首页提供推荐入口和常用分类，工具目录支持继续筛选，工具详情页可查看简介、基础信息并访问官网。
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">协作反馈</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <a
              href="https://github.com/yuyuyu6631/Next.js-AI-Tool-Demo"
              target="_blank"
              rel="noreferrer"
              className="block hover:text-slate-900"
            >
              项目仓库
            </a>
            <a
              href="https://github.com/yuyuyu6631/Next.js-AI-Tool-Demo/issues"
              target="_blank"
              rel="noreferrer"
              className="block hover:text-slate-900"
            >
              问题反馈
            </a>
            <Link href="/tools" className="block hover:text-slate-900">
              返回工具目录
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
