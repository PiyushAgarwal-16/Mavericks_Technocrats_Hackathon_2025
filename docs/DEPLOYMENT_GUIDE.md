# ZeroTrace Backend Deployment Guide

To make your ZeroTrace backend accessible from anywhere (so the downloaded app works for others), you need to deploy it to a public server.
We recommend **Render.com** because it is free and easy.

## Step 1: Push Code to GitHub
Ensure your latest code (including `backend/`) is pushed to your GitHub repository.
```bash
git add .
git commit -m "Prepare for deployment"
git push
```

## Step 2: Creates a Web Service on Render
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub account and select your repository (`Mavericks_Technocrats_Hackathon_2025`).
4.  **Configuration:**
    - **Name:** `zerotrace-backend` (or similar)
    - **Root Directory:** `backend` (Important!)
    - **Environment:** Node
    - **Build Command:** `npm install && npm run build` (Installs deps and compiles TypeScript)
    - **Start Command:** `npm start` (Runs the compiled JS)
    - **Instance Type:** Free

## Step 3: Environment Variables
Scroll down to "Environment Variables" and click **Add Environment Variable**. Add the following (from your local `.env`):

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` (Your FULL connection string from `.env`) |
| `JWT_SECRET` | `...` (Copy from `.env` or generate new) |
| `API_KEY` | `ZEROTRACE_AGENT_KEY_2025` |
| `CERT_PRIVATE_KEY_PATH` | `./keys/private.pem` |
| `CERT_PUBLIC_KEY_PATH` | `./keys/public.pem` |

**Important Note on Keys:** 
Render might throw an error if it can't find the key files.
- Ensure `backend/keys` folder is committed to Git (check `.gitignore`).
- If you excluded them for security (good practice), you must either:
    1.  Paste the **content** of the keys into Environment Variables (requires code change to read from env).
    2.  OR, for this hackathon, just **commit the keys** (remove `keys/` from `.gitignore` if present).

## Step 4: Deploy
Click **Create Web Service**. Render will start building.
Once done, it will give you a public URL (e.g., `https://zerotrace-backend.onrender.com`).

---

## Step 5: Update Frontend & App

### 1. Update Web App (Vercel)
1.  Go to your Vercel Project Settings -> Environment Variables.
2.  Add/Edit `VITE_API_BASE_URL`.
3.  Set it to your new Render URL: `https://zerotrace-backend.onrender.com/api` (don't forget `/api` if your routes are prefixed, or just the root if not. ZeroTrace usually uses `/certificates` directly? Check `web/src/services/api.ts`. Current default is `http://localhost:5000/api`. So add `/api`).
4.  Redeploy Vercel.

### 2. Update Flutter App
1.  Open `app/lib/screens/certificate_preview_screen.dart` (or wherever you instantiate `CertificateGenerator`).
2.  Change the default URL from `http://localhost:5000` to `https://zerotrace-backend.onrender.com/api`.
    - *Correction:* The `api.ts` uses `/api` suffix. The Flutter code uses base URL. Ensure they match.
3.  Rebuild the app: `flutter build windows`.
4.  Create the Zip again.

Now, anyone who downloads the zip can generate certificates that upload to your cloud!

---

# Alternative: Deploy on Railway.app

Power users might prefer Railway.

## Step 1: Create Project
1.  Login to [Railway.app](https://railway.app/) with GitHub.
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select `Mavericks_Technocrats_Hackathon_2025`.

## Step 2: Configure Service
1.  Click on the card for your repo to open settings.
2.  Go to **Settings** tab.
3.  **Root Directory**: Set to `/backend` (Important!).
4.  **Build Command**: `npm install && npm run build`.
5.  **Start Command**: `npm start`.

## Step 3: Variables
1.  Go to **Variables** tab.
2.  Add the same variables (`MONGO_URI`, `JWT_SECRET`, `API_KEY`, etc.).
3.  **Note**: Railway automatically provides a `PORT` variable, so you can ignore adding `PORT`, or set it to `5000` but ensure your app listens on `process.env.PORT`.

## Step 4: Expose Domain
1.  Go to **Settings** -> **Networking**.
2.  Click **Generate Domain** to get a public URL (e.g., `web-production-1234.up.railway.app`).
3.  Use this URL (plus `/api`) in your Vercel and Flutter apps.

### Troubleshooting Railway Build
If Railway fails with "file with no instructions" or picks up the wrong Dockerfile:
1.  Go to **Settings** -> **Build**.
2.  Set **Dockerfile Path** to `/backend/Dockerfile`.
3.  Ensure **Root Directory** is `/backend`.


