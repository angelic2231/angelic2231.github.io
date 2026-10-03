@echo off
chcp 65001 >nul
echo 正在检查并启动本地 Quartz 知识库服务...

:: 自动清理可能占用 8080 端口的残留旧进程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)

:: 启动浏览器打开本地地址
start "" "http://localhost:8080"

:: 启动本地热重载开发服务器
npx.cmd quartz build --serve