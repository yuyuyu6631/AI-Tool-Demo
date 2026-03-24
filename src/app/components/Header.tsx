import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AI 工具评测</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              首页
            </Link>
            <Link to="/rankings" className="text-gray-700 hover:text-blue-600 transition">
              榜单
            </Link>
            <Link to="/scenarios" className="text-gray-700 hover:text-blue-600 transition">
              场景推荐
            </Link>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition">
              关于我们
            </a>
          </nav>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
            <Link
              to="/rankings"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              查看热门榜单
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/rankings"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                榜单
              </Link>
              <Link
                to="/scenarios"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                场景推荐
              </Link>
              <a
                href="#about"
                className="text-gray-700 hover:text-blue-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                关于我们
              </a>
              <Link
                to="/rankings"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-center hover:bg-blue-700 transition"
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
