@echo off
echo ================================================================
echo    PUSHING ALL FILES TO GITHUB
echo    Repository: adityarkulkarni45-ux/pulse-hr-tool
echo ================================================================
echo.

cd /d "c:\Users\adity\Downloads\Pulse-HR-Tool-Prototype\hr-tool"

echo [1/6] Initializing Git repository...
git init
echo.

echo [2/6] Adding ALL files (not just README)...
git add .
echo.

echo [3/6] Creating commit with all files...
git commit -m "Initial commit: Complete Pulse HR Tool with deployment configs"
echo.

echo [4/6] Renaming branch to main...
git branch -M main
echo.

echo [5/6] Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/adityarkulkarni45-ux/pulse-hr-tool.git
echo.

echo [6/6] Pushing to GitHub...
echo.
echo You will be prompted for credentials:
echo   Username: adityarkulkarni45-ux
echo   Password: [Your Personal Access Token]
echo.
echo Get token at: https://github.com/settings/tokens/new
echo.
pause

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo    SUCCESS! All files pushed to GitHub
    echo ================================================================
    echo.
    echo Verify at: https://github.com/adityarkulkarni45-ux/pulse-hr-tool
    echo.
    echo Next: Deploy on Render
    echo.
) else (
    echo.
    echo ================================================================
    echo    PUSH FAILED
    echo ================================================================
    echo.
    echo Common issues:
    echo 1. Need Personal Access Token (not password)
    echo 2. Token needs 'repo' scope
    echo 3. Check internet connection
    echo.
)

pause
