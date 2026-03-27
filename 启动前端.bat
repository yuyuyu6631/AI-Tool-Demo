@echo off
setlocal

cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js，请先安装 Node.js 后再运行本脚本。
  pause
  exit /b 1
)

echo [2/3] 检查依赖...
if not exist "node_modules" (
  echo 未找到 node_modules，正在安装依赖...
  call npm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络或 npm 配置。
    pause
    exit /b 1
  )
)

echo [3/3] 启动前端开发服务...
echo 启动地址: http://127.0.0.1:3000/
echo 关闭服务请直接关闭当前窗口或按 Ctrl+C
echo.

call npm run dev:local
