#!/bin/bash

# Audio Visualizer Deployment Script
# This script helps you deploy your app to GitHub and Vercel

echo "🎵 Audio Visualizer Deployment Helper"
echo "======================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "📝 You have uncommitted changes. Let's commit them!"
    echo ""
    
    # Show status
    git status --short
    echo ""
    
    # Ask for commit message
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update: Audio Visualizer improvements"
    fi
    
    # Stage and commit
    git add .
    git commit -m "$commit_msg"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo "🔗 No GitHub remote found. Let's add one!"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " repo_url
    
    if [ -n "$repo_url" ]; then
        git remote add origin "$repo_url"
        echo "✅ Remote added"
    else
        echo "⚠️  No URL provided. You'll need to add it manually:"
        echo "   git remote add origin YOUR_REPO_URL"
    fi
fi

# Check current branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo ""
    echo "🔄 Renaming branch to 'main'..."
    git branch -M main
    echo "✅ Branch renamed to main"
fi

# Push to GitHub
echo ""
echo "🚀 Ready to push to GitHub!"
read -p "Push to GitHub now? (y/n): " push_confirm

if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    echo "✅ Pushed to GitHub!"
else
    echo "⏭️  Skipped push. You can push manually with: git push -u origin main"
fi

echo ""
echo "🎉 GitHub setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://vercel.com"
echo "2. Sign in with your GitHub account"
echo "3. Click 'Add New...' → 'Project'"
echo "4. Import your repository"
echo "5. Add environment variable:"
echo "   NEXT_PUBLIC_INFERENCE_URL = your-inference-endpoint"
echo "6. Click 'Deploy'"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "✨ Happy deploying!"
