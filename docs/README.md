# Phleg Digital Oracle - GitHub Pages Deployment

This directory contains the static website for Phleg's "Digital Oracle" landing page, designed for deployment on GitHub Pages.

## Files Structure

```
docs/
├── index.html          # Main HTML page (renamed from phleg-oracle.html)
├── .nojekyll           # Disables Jekyll processing on GitHub Pages
└── README.md           # This deployment guide
```

## Deployment Instructions

### Option 1: Deploy from `docs` folder (Recommended)

1. **Commit the changes** to your repository:
   ```bash
   git add docs/
   git commit -m "Add Phleg Digital Oracle landing page for GitHub Pages"
   git push origin main
   ```

2. **Configure GitHub Pages** in your repository settings:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**
   - Under **Branch**, select **main** (or your default branch)
   - Under **Folder**, select **/docs**
   - Click **Save**

3. **Wait for deployment** (usually takes 1-2 minutes)
   - Your site will be available at: `https://[your-username].github.io/[repository-name]/`

### Option 2: Deploy from `gh-pages` branch

If you prefer to use a separate branch:

1. **Create and switch to gh-pages branch**:
   ```bash
   git checkout -b gh-pages
   ```

2. **Move files to root** (copy contents of `docs/` to root of gh-pages branch):
   ```bash
   # Copy files from docs to root
   cp -r docs/* .
   git add .
   git commit -m "Deploy Phleg Digital Oracle to GitHub Pages"
   git push origin gh-pages
   ```

3. **Configure GitHub Pages**:
   - Go to **Settings** → **Pages**
   - Select **Deploy from a branch**
   - Choose **gh-pages** branch
   - Select **/(root)** folder
   - Click **Save**

## Custom Domain (Optional)

To use a custom domain like `phleg.dev`:

1. **Create CNAME file** in `docs/` folder:
   ```
   phleg.dev
   ```
   or
   ```
   www.phleg.dev
   ```

2. **Configure DNS** with your domain provider:
   - Add a CNAME record pointing to `[your-username].github.io`
   - Or add A records for GitHub Pages IP addresses

3. **Update GitHub Pages settings**:
   - In **Settings** → **Pages** → **Custom domain**, enter your domain
   - Check **Enforce HTTPS**

## Local Testing

Before deploying, test locally:

1. **Using Python's HTTP server**:
   ```bash
   cd docs
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000`

2. **Using Node.js http-server**:
   ```bash
   npx http-server docs -p 8000
   ```

## Features of This Deployment

- **Static HTML/CSS/JS**: No build process required
- **Responsive Design**: Works on mobile and desktop
- **Matrix + Ancient Greek Theme**: Unique aesthetic combining cyberpunk and classical elements
- **Interactive Elements**: Animated Matrix rain, typing effects, hover animations
- **No External Dependencies**: All fonts loaded from Google Fonts CDN

## Troubleshooting

### Page not updating?
- GitHub Pages cache can take a few minutes to clear
- Force refresh with Ctrl+F5 or Cmd+Shift+R
- Check GitHub Actions for deployment status

### 404 Error?
- Ensure `index.html` is in the correct folder (`docs/` for main branch deployment)
- Check GitHub Pages source settings

### Jekyll processing issues?
- The `.nojekyll` file prevents GitHub from processing the page with Jekyll
- If you see raw HTML, ensure `.nojekyll` is present

### Custom domain not working?
- DNS changes can take up to 24 hours to propagate
- Verify CNAME/A records are correct
- Check GitHub Pages settings for domain verification

## Maintenance

To update the page:

1. Edit the original `phleg-oracle.html` file
2. Copy to `docs/index.html`
3. Commit and push changes
4. GitHub Pages will automatically redeploy

## License

The website design is part of the Phleg project. See the main repository for license details.

---

**Live Site**: `https://[your-username].github.io/[repository-name]/`

**Last Updated**: December 2025