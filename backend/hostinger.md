# Hostinger Deployment Guide — IYO Immo Backend

## 1. Upload files

Upload the entire `backend/` folder to your Hostinger Node.js hosting root
(usually via File Manager or FTP/SFTP).

**Do NOT upload `node_modules/` or `data/` — these are created on the server.**

## 2. Install dependencies

In Hostinger's terminal / SSH:
```bash
npm install
```

## 3. Create .env file on the server

In the root of your uploaded `backend/` folder, create a `.env` file with:

```
PORT=3000
JWT_SECRET=iyoimmo_super_secret_jwt_2026_bangui
NODE_ENV=production
DB_PATH=./data
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=https://chobrandone.github.io
```

> **Note:** Hostinger sets the port automatically — use `PORT=3000` or check
> your Hostinger Node.js panel for the correct port.

## 4. Seed the database (first time only)

```bash
node setup.js
```

## 5. Start the server

```bash
node server.js
```

Hostinger will usually manage this automatically via the Node.js panel
(it calls `npm start` which runs `node server.js`).

## 6. Set entry point in Hostinger panel

In your Hostinger Node.js hosting panel:
- **Node.js version:** 18 or 20
- **Entry point / start file:** `server.js`
- **NPM script:** `start`

## 7. Update your GitHub Secret

After deployment, your backend URL will be something like:
```
https://your-subdomain.hostinger-server.com
```

Copy that URL and set it as the `VITE_API_URL` secret in your GitHub repo
(Settings → Secrets → Actions → VITE_API_URL).

This makes the frontend call your Hostinger backend in production.
