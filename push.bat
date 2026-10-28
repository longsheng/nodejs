@echo off
chcp 936 >nul
setlocal
title CloudBase 云托管一键部署 - api

rem ============================================================
rem  CloudBase 云托管 一键部署脚本
rem  用法：改完 index.js 后，双击本文件（或在 cmd 里运行 push.bat）
rem  作用：上传代码 -> 云端构建镜像 -> 切流量 -> 确认线上真的生效
rem  注意：本文件必须是 GBK 编码 + CRLF 换行，改动后不要用编辑器存成 UTF-8
rem ============================================================

rem 切换到脚本所在目录，保证在任意位置双击都能正常工作
cd /d "%~dp0"

rem ---------- 可修改的配置区 ----------
set "SERVICE=api"
set "PORT=80"
set "DOMAIN=https://api-315292-10-1252627155.sh.run.tcloudbase.com"
rem 等待「没有进行中的部署任务」的最大轮数，每轮 5 秒
set "MAXIDLE=36"
rem 等待「线上版本与本地一致」的最大轮数，每轮 5 秒
set "MAXTRY=30"
rem ------------------------------------

rem ------------------------------------------------------------------
rem 版本号提取规则（本地 index.js 和线上页面用同一套规则，保证可比）
rem   index.js 里的写法：<h1>Hello CloudBase Ver:0.0.7</h1>
rem   · 首选：Ver:0.0.7  -> 取出数字 0.0.7
rem   · 兜底：v0.6       -> 取出数字 0.6（老写法，兼容用）
rem 改版式时只改这里，或直接改 index.js 里的 Ver: 写法
rem ------------------------------------------------------------------
set "VEREXPR=if ($s -match 'Ver:\s*([0-9.]+)') { Write-Output $matches[1] } elseif ($s -match 'v([0-9]+\.[0-9]+)') { Write-Output $matches[1] }"

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
echo [1/4] 检查登录状态 ...
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

rem ---------- 步骤 2：确认没有进行中的部署 ----------
rem 平台若检测到还有部署任务在跑，会额外弹一个「是否取消旧任务继续」的提示。
rem 那个提示应答后 CLI 有时会提前返回，导致后面判断不准，所以先等它跑完。
echo [2/4] 检查是否有进行中的部署任务 ...
set /a IDLEN=0
:idlecheck
set "BUSY="
for /f "usebackq delims=" %%s in (`call tcb cloudrun record list -s %SERVICE% 2^>nul ^| findstr /i /c:"creating"`) do set "BUSY=1"
if not defined BUSY goto :idle
set /a IDLEN+=1
if %IDLEN% geq %MAXIDLE% (
    echo       等待超时，仍检测到进行中的任务，将直接尝试部署。
    goto :idle
)
echo       有部署任务正在进行，等待其完成... ^(%IDLEN%/%MAXIDLE%^)
timeout /t 5 /nobreak >nul 2>nul
goto :idlecheck

:idle
echo       平台空闲，可以开始部署。
echo.

rem ---------- 步骤 3：上传代码并构建 ----------
echo [3/4] 上传代码并构建镜像，通常 30~90 秒，请勿关闭窗口 ...
echo       交互提示按默认项自动应答：不灰度、有任务冲突则确认覆盖。
echo.

rem ------------------------------------------------------------------
rem 关键：tcb 部署过程中可能出现不止一个交互提示
rem   (1) ? Enable gray deployment?                            -> 选默认 No
rem   (2) ? Platform currently has deployment tasks running...  -> 敲回车即 Y
rem 若只喂一个回车，第二个提示会读到 EOF，部署会被中止
rem （现象："[失败] 部署命令返回错误"）。所以准备含多个回车的应答文件。
rem ------------------------------------------------------------------
set "ANS=%TEMP%\tcb_deploy_answers.txt"
(
    echo.
    echo.
    echo.
    echo.
    echo.
) > "%ANS%" 2>nul

if not exist "%ANS%" (
    echo [错误] 无法创建应答文件：%ANS%
    echo        可能是 TEMP 目录不可写，请手动运行部署命令。
    echo.
    pause
    exit /b 1
)

call tcb cloudrun deploy -s %SERVICE% --source "%SRC%" --port %PORT% --min-num 0 --max-num 1 --open-access-types OA,PUBLIC,MINIAPP --wait --force < "%ANS%"
set "DEPLOYRC=%errorlevel%"

if exist "%ANS%" del "%ANS%" >nul 2>nul

echo.
if "%DEPLOYRC%"=="0" (
    echo       部署已提交。
) else (
    echo       CLI 返回非 0 退出码，但部署可能已经提交。
    echo       下面以线上实际版本为准来判断成败。
)
echo.

rem ---------- 步骤 4：等待线上生效并验证 ----------
rem 说明：
rem  · 走「覆盖运行中任务」那条路时，CLI 提交完就返回，--wait 不生效，
rem    所以不能立刻验证，必须自己轮询到线上版本等于本地版本为止。
rem  · 网页内容是 UTF-8、窗口是 GBK，直接输出网页中文会乱码，
rem    因此只用 ASCII 比对版本号来判断是否生效。
echo [4/4] 等待线上生效 ...

rem 从本地 index.js 里提取版本号（形如 Ver:0.0.7）
set "LOCALVER="
for /f "usebackq delims=" %%v in (`powershell -NoProfile -Command "$s = Get-Content -Raw -Encoding UTF8 'index.js'; %VEREXPR%"`) do set "LOCALVER=%%v"
if defined LOCALVER (echo       本地版本 : %LOCALVER%) else (echo       本地版本 : 未识别，将只检查可访问性)
echo       轮询中，每 5 秒一次，最多 150 秒 ...
echo.

set /a TRIES=0
:verify
set /a TRIES+=1
set "ONLINEVER="
for /f "usebackq delims=" %%v in (`curl -s --max-time 20 "%DOMAIN%/" ^| powershell -NoProfile -Command "$s = [Console]::In.ReadToEnd(); %VEREXPR%"`) do set "ONLINEVER=%%v"
if not defined ONLINEVER set "ONLINEVER=unknown"

if not defined LOCALVER goto :online_only
if /i "%ONLINEVER%"=="%LOCALVER%" goto :ok
goto :next_try

:online_only
if not "%ONLINEVER%"=="unknown" goto :ok
goto :next_try

:next_try
if %TRIES% geq %MAXTRY% goto :timeout
timeout /t 5 /nobreak >nul 2>nul
goto :verify

:ok
curl -s -o nul -w "       HTTP status : %%{http_code}\n" --max-time 20 "%DOMAIN%/"
echo       线上版本 : %ONLINEVER%
echo       与本地一致 : 是（第 %TRIES% 次检查时生效）
echo.
echo ============================================================
echo   部署成功，线上已是 %ONLINEVER%。
echo   浏览器如仍显示旧内容，请按 Ctrl + F5 强制刷新。
echo ============================================================
echo.
pause
exit /b 0

:timeout
curl -s -o nul -w "       HTTP status : %%{http_code}\n" --max-time 20 "%DOMAIN%/"
echo       线上版本 : %ONLINEVER%
echo       本地版本 : %LOCALVER%
echo.
echo       [未生效] 150 秒内线上还没变成 %LOCALVER%。
echo       若构建失败，CLI 返回码为 %DEPLOYRC%，可查：
echo         tcb cloudrun record list -s %SERVICE%
echo         tcb cloudrun logs build -s %SERVICE%
echo       若只是构建较慢，稍等后按 Ctrl + F5 刷新即可。
echo.
pause
exit /b 1
