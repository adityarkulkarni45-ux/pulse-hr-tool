@echo off
echo ========================================
echo  Opening Browser with Disabled Cache
echo ========================================
echo.
echo Server should be running on: http://localhost:4000
echo.
echo This will open Chrome in Incognito mode (no cache)
echo.
pause

start chrome --incognito http://localhost:4000

echo.
echo Browser opened!
echo.
echo If you don't see the new interface:
echo 1. Press Ctrl + Shift + R
echo 2. Or close browser and try again
echo.
pause
