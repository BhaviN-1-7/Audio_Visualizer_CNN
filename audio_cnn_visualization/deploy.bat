@echo off
echo.
echo ========================================
echo   Audio Visualizer Deployment Helper
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo Git initialized!
) else (
    echo Git repository already exists
)

echo.
echo Checking for uncommitted changes...
git status --short

echo.
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update: Audio Visualizer improvements

echo.
echo Staging and committing changes...
git add .
git commit -m "%commit_msg%"

echo.
echo Checking current branch...
git branch -M main

echo.
echo ========================================
echo   Ready to push to GitHub!
echo ========================================
echo.
echo Before pushing, make sure you have:
echo 1. Created a repository on GitHub
echo 2. Copied the repository URL
echo.

set /p repo_url="Enter your GitHub repository URL (or press Enter to skip): "

if not "%repo_url%"=="" (
    echo Adding remote...
    git remote remove origin 2>nul
    git remote add origin %repo_url%
    
    echo.
    echo Pushing to GitHub...
    git push -u origin main
    
    echo.
    echo ========================================
    echo   Successfully pushed to GitHub!
    echo ========================================
) else (
    echo.
    echo Skipped GitHub push.
    echo To push manually, run:
    echo   git remote add origin YOUR_REPO_URL
    echo   git push -u origin main
)

echo.
echo ========================================
echo   Next Steps: Deploy to Vercel
echo ========================================
echo.
echo 1. Go to https://vercel.com
echo 2. Sign in with your GitHub account
echo 3. Click 'Add New...' -^> 'Project'
echo 4. Import your repository
echo 5. Add environment variable:
echo    Name: NEXT_PUBLIC_INFERENCE_URL
echo    Value: your-inference-endpoint-url
echo 6. Click 'Deploy'
echo.
echo For detailed instructions, see DEPLOYMENT.md
echo.
echo Happy deploying!
echo.
pause
