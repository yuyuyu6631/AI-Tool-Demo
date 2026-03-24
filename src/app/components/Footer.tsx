export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 平台简介 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">关于平台</h3>
            <p className="text-sm leading-relaxed">
              AI 工具评测平台致力于为用户提供专业、客观的 AI 工具评测和推荐服务，帮助用户快速找到最适合的 AI 解决方案。
            </p>
          </div>

          {/* 免责声明 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">免责声明</h3>
            <p className="text-sm leading-relaxed">
              本平台提供的评测内容仅供参考，实际使用效果可能因场景而异。所有工具的商标和版权归其各自所有者所有。
            </p>
          </div>

          {/* 合作联系 */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">合作联系</h3>
            <p className="text-sm leading-relaxed">
              商务合作：business@example.com
              <br />
              内容投稿：content@example.com
              <br />
              技术支持：support@example.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© 2026 AI 工具评测平台. All rights reserved. | 本站为演示项目</p>
        </div>
      </div>
    </footer>
  );
}
