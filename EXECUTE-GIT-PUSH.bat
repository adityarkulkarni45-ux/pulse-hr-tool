@echo off
cls
echo ================================================================
echo    PUSHING PULSE HR TOOL TO GITHUB
echo    Repository: adityarkulkarni45-ux/pulse-hr-tool
echo ================================================================
echo.
echo This will execute these commands in order:
echo   1. git init
echo   2. git add .
echo   3. git commit -m "Initial commit: Complete Pulse HR Tool"
echo   4. git branch -M main
echo   5. git remote add origin https://github.com/adityarkulkarni45-ux/pulse-hr-tool.git
echo   6. git push -u origin main
echo.
echo Press any key to start...
pause >nul
echo.

cd /d "c:\Users\adity\Downloads\Pulse-HR-Tool-Prototype\hr-tool"

echo ================================================================
echo [1/6] Initializing Git repository...
echo ================================================================
git init
if %errorlevel% neq 0 (
    echo ERROR at step 1!
    pause
    exit /b 1
)
echo ✓ Done
echo.

echo ================================================================
echo [2/6] Adding ALL files...
echo ================================================================
git add .
if %errorlevel% neq 0 (
    echo ERROR at step 2!
    pause
    exit /b 1
)
echo ✓ Done
echo.

echo ================================================================
echo [3/6] Creating commit...
echo ================================================================
git commit -m "Initial commit: Complete Pulse HR Tool"
if %errorlevel% neq 0 (
    echo ERROR at step 3!
    pause
    exit /b 1
)
echo ✓ Done
echo.

echo ================================================================
echo [4/6] Renaming branch to main...
echo ================================================================
git branch -M main
if %errorlevel% neq 0 (
    echo ERROR at step 4!
    pause
    exit /b 1
)
echo ✓ Done
echo.

echo ================================================================
echo [5/6] Adding GitHub remote...
echo ================================================================
git remote remove origin 2>nul
git remote add origin https://github.com/adityarkulkarni45-ux/pulse-hr-tool.git
if %errorlevel% neq 0 (
    echo ERROR at step 5!
    pause
    exit /b 1
)
echo ✓ Done
echo.

echo ================================================================
echo [6/6] Pushing to GitHub...
echo ================================================================
echo.
echo You will be prompted for credentials:
echo   Username: adityarkulkarni45-ux
echo   Password: [Your Personal Access Token]
echo.
echo If you don't have a token, get one at:
echo https://github.com/settings/tokens/new
echo   - Select scope: repo (full control)
echo   - Copy token and use as password
echo.
echo Press any key to continue with push...
pause >nul
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo    ✓ SUCCESS! ALL FILES PUSHED TO GITHUB!
    echo ================================================================
    echo.
    echo Your repository is now live at:
    echo https://github.com/adityarkulkarni45-ux/pulse-hr-tool
    echo.
    echo Next steps:
    echo 1. Verify files on GitHub
    echo 2. Deploy backend on Render
    echo 3. Deploy frontend on Vercel
    echo.
    echo Check DEPLOYMENT-GUIDE.md for instructions!
    echo.
) else (
    echo.
    echo ================================================================
    echo    ✗ PUSH FAILED
    echo ================================================================
    echo.
    echo Common issues:
    echo 1. Wrong credentials (need Personal Access Token, not password)
    echo 2. Token doesn't have 'repo' scope
    echo 3. Repository already exists with different content
    echo 4. No internet connection
    echo.
    echo Try again or check:
    echo https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
    echo.
)

pause
