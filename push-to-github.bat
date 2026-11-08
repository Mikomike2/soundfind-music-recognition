@echo off
echo ===============================================
echo    Pushing to GitHub
echo ===============================================
echo.

REM Initialize git repository
echo [1/7] Initializing git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: Git is not found in PATH. Please restart your terminal or check Git installation.
    pause
    exit /b 1
)
echo.

REM Add all files
echo [2/7] Adding all files...
git add .
echo.

REM Create first commit
echo [3/7] Creating first commit...
git commit -m "Initial commit: AI-Powered Song Recognition app"
echo.

REM Add remote repository
echo [4/7] Adding remote repository...
git remote add origin https://github.com/Mikomike2/soundfind-music-recognition.git
echo.

REM Set main branch
echo [5/7] Setting main branch...
git branch -M main
echo.

REM Push to GitHub
echo [6/7] Pushing to GitHub...
git push -u origin main
echo.

echo [7/7] Done!
echo.
echo ===============================================
echo    Successfully pushed to GitHub!
echo    Visit: https://github.com/Mikomike2/soundfind-music-recognition
echo ===============================================
echo.

pause
