@echo off
echo ============================================
echo    PUSHING DEPLOYMENT FILES TO GITHUB
echo ============================================
echo.

cd /d "c:\Users\adity\Downloads\Pulse-HR-Tool-Prototype\hr-tool"

echo [1/4] Checking current directory...
cd
echo.

echo [2/4] Adding all files to Git...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Git add failed!
    pause
    exit /b 1
)
echo Files staged successfully!
echo.

echo [3/4] Creating commit...
git commit -m "Add deployment configurations for Render and Vercel"
if %errorlevel% neq 0 (
    echo Note: Nothing to commit or already committed
)
echo.

echo [4/4] Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Common issues:
    echo 1. Repository not set up - run push-to-github-auto.bat first
    echo 2. Not authenticated - enter your GitHub credentials
    echo 3. No internet connection
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo    SUCCESS! Files pushed to GitHub
echo ============================================
echo.
echo Your deployment files are now on GitHub:
echo https://github.com/adityarkulkarni45-ux/pulse-hr-tool
echo.
echo Next Steps:
echo 1. Deploy backend on Render.com
echo 2. Deploy frontend on Vercel.com
echo.
echo Read QUICK-DEPLOY.md for instructions!
echo.
pause
