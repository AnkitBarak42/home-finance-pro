# Deploying Home Finance Pro to GitHub Pages

This project is now configured to build as a **static export** and deploy
automatically to GitHub Pages via GitHub Actions.

## What was changed
- `next.config.js` — added `output: "export"`, `images.unoptimized`, and an
  optional `basePath` driven by an env var.
- `.github/workflows/deploy.yml` — builds the app and publishes it to Pages
  on every push to `main`.

## One-time setup

### 1. Push this project to a new GitHub repo
```bash
cd hfp
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Add your Firebase config as repo secrets
Go to **Settings → Secrets and variables → Actions → New repository secret**
and add each of these (values come from your Firebase project settings,
same ones from `.env.local.example`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Set the base path secret (only if not a root user/org page)
If your repo is **not** named `YOUR_USERNAME.github.io`, your site will be
served from `https://YOUR_USERNAME.github.io/YOUR_REPO/`, so add one more
secret:

- `NEXT_PUBLIC_BASE_PATH` = `/YOUR_REPO` (e.g. `/home-finance-pro`)

If your repo **is** named `YOUR_USERNAME.github.io`, skip this — leave the
secret unset.

### 4. Enable GitHub Pages with Actions as the source
Go to **Settings → Pages** → under "Build and deployment", set **Source** to
**GitHub Actions**.

### 5. Push / re-run the workflow
Push a commit (or go to the **Actions** tab and re-run the workflow). After
it finishes, your site will be live at:
- `https://YOUR_USERNAME.github.io` (root repo), or
- `https://YOUR_USERNAME.github.io/YOUR_REPO/` (project repo)

## Important: Firebase Auth authorized domain
Firebase Auth blocks sign-in from domains it doesn't recognize. Add your
GitHub Pages domain to the allow-list:

**Firebase Console → Authentication → Settings → Authorized domains → Add domain**
→ enter `YOUR_USERNAME.github.io`

## Note on client-side routing
Since this is a static export with client-side navigation (`router.replace`,
etc.), direct hits to `/dashboard` or `/login` work fine because Next.js
pre-renders an HTML file for each route (`/dashboard/index.html`, etc.) —
no extra 404 redirect trick needed here.

## Local build test (optional, before pushing)
```bash
npm install
npm run build      # outputs static site to ./out
npx serve out       # preview it locally
```
