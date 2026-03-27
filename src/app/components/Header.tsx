import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import BrandMark from "./BrandMark";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <BrandMark label="aitoolbox" size="sm" />
            <div>
              <span className="block text-base font-semibold text-gray-900">aitoolbox</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              首页
            </Link>
            <Link to="/rankings" className="text-sm text-gray-600 hover:text-gray-900 transition">
              榜单
            </Link>
            <Link to="/scenarios" className="text-sm text-gray-600 hover:text-gray-900 transition">
              场景推荐
            </Link>
            <a
              href="https://binarysee.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              关于我们
            </a>
          </nav>

          <div className="hidden md:block">
            <Link
              to="/rankings"
              className="px-4 py-2 btn-primary rounded-full text-sm transition"
            >
              查看热门榜单
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg border border-gray-200 bg-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-sm text-gray-700 hover:text-gray-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/rankings"
                className="text-sm text-gray-700 hover:text-gray-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                榜单
              </Link>
              <Link
                to="/scenarios"
                className="text-sm text-gray-700 hover:text-gray-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                场景推荐
              </Link>
              <a
                href="https://binarysee.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-gray-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                关于我们
              </a>
              <Link
                to="/rankings"
                className="px-4 py-2 btn-primary rounded-full text-center text-sm transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                查看热门榜单
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
