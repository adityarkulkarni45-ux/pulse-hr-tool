@echo off
echo ============================================
echo    PUSH PULSE HR TOOL TO GITHUB
echo    GitHub: adityarkulkarni45-ux
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/8] Checking Git configuration...
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo Configuring Git...
    git config --global user.name "Aditya Kulkarni"
    git config --global user.email "adityarkulkarni45@gmail.com"
    echo Git configured!
) else (
    echo Git already configured
)
echo.

echo [2/8] Initializing Git Repository...
if not exist .git (
    git init
    echo Repository initialized!
) else (
    echo Repository already initialized
)
echo.

echo [3/8] Preparing README for GitHub...
if exist README-GITHUB.md (
    copy README.md README-LOCAL.md >nul 2>&1
    copy README-GITHUB.md README.md >nul
    echo README updated!
)
echo.

echo [4/8] Adding all files to Git...
git add .
echo Files staged!
echo.

echo [5/8] Creating initial commit...
git commit -m "Initial commit: Pulse HR Tool - Complete HR management system with zero dependencies"
if %errorlevel% equ 0 (
    echo Commit created successfully!
) else (
    echo Commit failed or already exists
)
echo.

echo [6/8] Adding GitHub remote...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/adityarkulkarni45-ux/pulse-hr-tool.git
echo Remote added!
echo.

echo [7/8] Setting branch to main...
git branch -M main
echo Branch set to main!
echo.

echo ============================================
echo    READY TO PUSH!
echo ============================================
echo.
echo Your repository URL:
echo https://github.com/adityarkulkarni45-ux/pulse-hr-tool
echo.
echo NEXT: Create the repository on GitHub
echo.
echo 1. Go to: https://github.com/new
echo 2. Repository name: pulse-hr-tool
echo 3. Description: Modern HR Management System with Zero Dependencies
echo 4. Select: Public (for portfolio)
echo 5. DON'T check any boxes (no README, no .gitignore)
echo 6. Click "Create repository"
echo.
echo After creating the repository, press ENTER to push...
pause

echo.
echo [8/8] Pushing to GitHub...
echo.
echo You will be prompted for:
echo    Username: adityarkulkarni45-ux
echo    Password: [Your Personal Access Token]
echo.
echo Don't have a token? Get one at:
echo https://github.com/settings/tokens/new
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo    SUCCESS! 🎉
    echo ============================================
    echo.
    echo Your project is now on GitHub!
    echo.
    echo View at: https://github.com/adityarkulkarni45-ux/pulse-hr-tool
    echo.
) else (
    echo.
    echo ============================================
    echo    PUSH FAILED
    echo ============================================
    echo.
    echo Common issues:
    echo 1. Repository doesn't exist - create it first!
    echo 2. Wrong token - generate new at github.com/settings/tokens
    echo 3. Token expired - create a new one
    echo.
    echo Try again or check GITHUB-SETUP.md for help
    echo.
)

pause
