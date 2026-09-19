@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add -A
git diff --cached --quiet
if %errorlevel% equ 0 (
  echo 没有需要同步的改动。
  pause
  exit /b 0
)
git commit -m "Update site"
if errorlevel 1 goto failed
git push
if errorlevel 1 goto failed
echo 已同步到 GitHub，线上网站会自动更新。
pause
exit /b 0
:failed
echo 同步失败，请把这个窗口截图发给我。
pause
exit /b 1
