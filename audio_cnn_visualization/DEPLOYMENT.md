# 🚀 Deployment Guide

Complete guide to deploy your Audio Visualizer to GitHub and Vercel.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [GitHub account](https://github.com/)
- [Vercel account](https://vercel.com/) (free)
- Your Modal inference endpoint URL

## 🔧 Step 1: Prepare Your Project

1. **Ensure all files are saved**
   - Check that all your changes are saved in VS Code

2. **Test locally**
   ```bash
   npm run build
   npm start
   ```
   Visit `http://localhost:3000` to verify everything works

## 📦 Step 2: Push to GitHub

### Option A: Using Git Command Line

1. **Navigate to your project directory**
   ```bash
   cd c:\Users\pacha\OneDrive\Documents\PROJECTS\CNN_AudioClassification\audio_cnn_visualization
   ```

2. **Initialize Git repository** (if not already initialized)
   ```bash
   git init
   ```

3. **Add all files**
   ```bash
   git add .
   ```

4. **Commit your changes**
   ```bash
   git commit -m "Initial commit: Audio Visualizer with CNN feature maps"
   ```

5. **Create a new repository on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Name: `audio-cnn-visualization` (or your preferred name)
   - Description: "Neural network audio classification visualizer"
   - Keep it **Public** or **Private** (your choice)
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

6. **Link your local repo to GitHub**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/audio-cnn-visualization.git
   git push -u origin main
   ```

### Option B: Using GitHub Desktop

1. **Download [GitHub Desktop](https://desktop.github.com/)**
2. Open GitHub Desktop
3. Click "Add" → "Add Existing Repository"
4. Browse to your project folder
5. Click "Publish repository"
6. Choose name and visibility
7. Click "Publish Repository"

## 🌐 Step 3: Deploy to Vercel

### Method 1: Import from GitHub (Recommended)

1. **Go to [vercel.com](https://vercel.com)**

2. **Sign in** with your GitHub account

3. **Click "Add New..." → "Project"**

4. **Import your repository**
   - Find `audio-cnn-visualization` in the list
   - Click "Import"

5. **Configure your project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

6. **Add Environment Variables**
   - Click "Environment Variables"
   - Add variable:
     - **Name**: `NEXT_PUBLIC_INFERENCE_URL`
     - **Value**: Your Modal inference endpoint URL
     - Example: `https://onlydownloads-7657--audio-cnn-inference-audioclassif-abcbbc-dev.modal.run/inference`
   - Click "Add"

7. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete
   - 🎉 Your app is live!

### Method 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variable when asked

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

## 🔄 Step 4: Automatic Deployments

Once connected, Vercel will automatically:
- ✅ Deploy every push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Run builds and tests
- ✅ Provide deployment URLs

## 🛠️ Step 5: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## 📊 Post-Deployment Checklist

- [ ] Visit your deployment URL
- [ ] Test audio file upload
- [ ] Verify visualizations render correctly
- [ ] Check mobile responsiveness
- [ ] Test error handling
- [ ] Monitor performance in Vercel Analytics

## 🔍 Troubleshooting

### Build Fails

**Issue**: Build fails with TypeScript errors
```bash
# Run locally to see errors
npm run typecheck
npm run build
```

**Issue**: Missing environment variables
- Check Vercel dashboard → Settings → Environment Variables
- Ensure `NEXT_PUBLIC_INFERENCE_URL` is set

### Runtime Errors

**Issue**: API calls fail
- Verify your inference endpoint is accessible
- Check CORS settings on your API
- Inspect Network tab in browser DevTools

**Issue**: 404 on refresh
- Next.js handles this automatically
- If using custom server, ensure proper routing

### Performance Issues

**Issue**: Slow loading
- Enable Vercel Analytics to identify bottlenecks
- Consider adding loading states
- Optimize images in `public/` folder

## 🔐 Security Best Practices

1. **Never commit `.env.local`** (already in .gitignore)
2. **Use environment variables** for all secrets
3. **Enable Vercel's security headers**
4. **Keep dependencies updated**: `npm audit fix`

## 📈 Monitoring

### Vercel Analytics
- Go to your project → Analytics
- View page views, performance metrics
- Monitor Core Web Vitals

### Vercel Logs
- Go to your project → Logs
- View real-time function logs
- Debug production issues

## 🔄 Making Updates

1. **Make changes locally**
2. **Test thoroughly**
   ```bash
   npm run dev
   npm run build
   ```
3. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. **Vercel auto-deploys** your changes!

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to GitHub

# Vercel
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View logs
```

## 📞 Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)

---

Happy Deploying! 🚀
