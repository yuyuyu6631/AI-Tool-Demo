export default function Footer() {
  return (
    <footer className="footer-shell py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">关于 aitoolbox</h3>
            <p className="text-sm leading-relaxed">
              aitoolbox 致力于为用户提供专业、客观的 AI 工具评测与推荐服务，
              帮助用户更快找到适合自己的解决方案。
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">免责声明</h3>
            <p className="text-sm leading-relaxed">
              本平台提供的评测内容仅供参考，实际使用效果可能因场景不同而变化。
              所有工具商标与版权归其各自所有者所有。
            </p>
          </div>

          <div>
            <h3 className="text-gray-900 font-semibold text-lg mb-4">合作联系</h3>
            <p className="text-sm leading-relaxed">
              商务合作：business@example.com
              <br />
              内容投稿：content@example.com
              <br />
              技术支持：support@example.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm">
          <p>© 2026 aitoolbox. All rights reserved. | 本站为演示项目</p>
        </div>
      </div>
    </footer>
  );
}
