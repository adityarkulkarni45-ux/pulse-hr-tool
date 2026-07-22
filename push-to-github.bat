@echo off
echo ============================================
echo    PUSH PULSE HR TOOL TO GITHUB
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

echo Step 1: Initializing Git Repository...
git init
if %errorlevel% neq 0 (
    echo Git already initialized or error occurred
)
echo.

echo Step 2: Configuring Git (if not configured)...
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    set /p username="Enter your name: "
    git config --global user.name "%username%"
    
    set /p email="Enter your email: "
    git config --global user.email "%email%"
)
echo Git configured!
echo.

echo Step 3: Preparing files...
echo Renaming README for GitHub...
if exist README-GITHUB.md (
    copy README.md README-LOCAL.md >nul
    copy README-GITHUB.md README.md >nul
    echo README updated!
) else (
    echo README-GITHUB.md not found, using existing README.md
)
echo.

echo Step 4: Adding files to Git...
git add .
echo All files staged!
echo.

echo Step 5: Creating commit...
git commit -m "Initial commit: Pulse HR Tool - Complete HR management system"
echo Commit created!
echo.

echo ============================================
echo NEXT STEPS:
echo ============================================
echo.
echo 1. Create a repository on GitHub:
echo    - Go to https://github.com/new
echo    - Repository name: pulse-hr-tool
echo    - Description: Modern HR Management System
echo    - Click "Create repository"
echo.
echo 2. Copy your repository URL from GitHub
echo    Example: https://github.com/yourusername/pulse-hr-tool.git
echo.
echo 3. Run these commands (replace with YOUR URL):
echo.
echo    git remote add origin https://github.com/yourusername/pulse-hr-tool.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Enter your GitHub credentials when prompted:
echo    - Username: your-github-username
echo    - Password: your-personal-access-token
echo.
echo Need a Personal Access Token?
echo - Go to: https://github.com/settings/tokens
echo - Generate new token (classic)
echo - Select 'repo' scope
echo - Copy and use as password
echo.
echo ============================================
echo.

set /p continue="Press ENTER to open GitHub setup guide... "
start GITHUB-SETUP.md

echo.
echo Good luck! 🚀
pause
