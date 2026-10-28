@echo off
chcp 936 >nul
setlocal
title CloudBase 云托管一键部署 - api

rem ============================================================
rem  CloudBase 云托管 一键部署脚本
rem  用法：改完 index.js 后，双击本文件（或在 cmd 里运行 push.bat）
rem  作用：把当前目录的代码上传到云端，构建镜像并切流量上线
rem  注意：本文件必须是 GBK 编码 + CRLF 换行，改动后不要用编辑器存成 UTF-8
rem ============================================================

rem 切换到脚本所在目录，保证在任意位置双击都能正常工作
cd /d "%~dp0"

rem ---------- 可修改的配置区 ----------
set "SERVICE=api"
set "PORT=80"
set "DOMAIN=https://api-315292-10-1252627155.sh.run.tcloudbase.com"
rem ------------------------------------

set "SRC=%~dp0"
if "%SRC:~-1%"=="\" set "SRC=%SRC:~0,-1%"

echo ============================================================
echo   CloudBase 云托管  一键部署
echo ------------------------------------------------------------
echo   服务名称 : %SERVICE%
echo   服务端口 : %PORT%
echo   源码目录 : %SRC%
echo   访问域名 : %DOMAIN%
echo ============================================================
echo.

rem ---------- 前置检查 1：tcb 命令是否存在 ----------
rem 注意：tcb 是 npm 生成的 tcb.cmd，调用时必须带 call，否则脚本会在这里直接退出
where tcb >nul 2>nul
if errorlevel 1 (
    echo [错误] 找不到 tcb 命令，说明 CloudBase CLI 没装或不在 PATH 里。
    echo        请先在命令行执行：npm i -g @cloudbase/cli
    echo.
    pause
    exit /b 1
)

rem ---------- 前置检查 2：是否已登录 ----------
echo [1/3] 检查登录状态 ...
call tcb env list >nul 2>nul
if errorlevel 1 (
    echo.
    echo [错误] 尚未登录，或登录凭证已失效。
    echo        请在本窗口执行：tcb login
    echo        登录成功后再重新运行本脚本。
    echo.
    pause
    exit /b 1
)
echo       登录正常。
echo.

rem ---------- 步骤 2：上传代码并构建 ----------
echo [2/3] 上传代码并构建镜像，通常 30~90 秒，请勿关闭窗口 ...
echo       （中途「是否灰度部署」的交互提示会被自动回车跳过）
echo.

rem 关键：前面的 echo. 和竖线用来给交互提示喂一个回车，选默认项
echo.| call tcb cloudrun deploy -s %SERVICE% --source "%SRC%" --port %PORT% --min-num 0 --max-num 1 --open-access-types OA,PUBLIC,MINIAPP --wait --force

if errorlevel 1 (
    echo.
    echo [失败] 部署命令返回错误，请查看上面的输出。
    echo        常用排查命令：
    echo          tcb cloudrun record list -s %SERVICE%
    echo          tcb cloudrun logs build -s %SERVICE%
    echo.
    pause
    exit /b 1
)
echo.
echo       部署命令执行完毕。
echo.

rem ---------- 步骤 3：验证线上 ----------
rem 说明：网页内容是 UTF-8，本窗口是 GBK，直接输出网页中文会乱码，
rem       所以这里只回显 ASCII 信息（状态码、标题、版本号）来判断是否生效。
echo [3/3] 验证线上访问 ...
where curl >nul 2>nul
if errorlevel 1 (
    echo       本机没有 curl，已跳过自动验证，请手动用浏览器打开：
    echo       %DOMAIN%
    goto :done
)

rem 给容器一点启动时间（体验版缩容到 0，首次访问是冷启动）
timeout /t 3 /nobreak >nul 2>nul
curl -s -o nul -w "       HTTP status : %%{http_code}\n" --max-time 25 "%DOMAIN%/"
echo       页面标题    :
curl -s --max-time 25 "%DOMAIN%/" | findstr /i /c:"<title>"
echo       页面版本    :
curl -s --max-time 25 "%DOMAIN%/" | powershell -NoProfile -Command "$s = [Console]::In.ReadToEnd(); if ($s -match 'v[0-9]+\.[0-9]+') { Write-Output $matches[0] }"
echo.

:done
echo ============================================================
echo   完成。
echo   浏览器如仍显示旧内容，请按 Ctrl + F5 强制刷新。
echo ============================================================
echo.
pause
exit /b 0
