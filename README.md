# IYO Immo — Plateforme Immobilière

> Votre rêve devient réalité · Full-stack real estate platform · Bangui, CAR

## ⚡ Quick Start (2 steps, no MongoDB needed)

### 1. Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Run
**Double-click `start-dev.bat`** — it does everything automatically:
- Sets up the database on first run
- Starts the backend API
- Starts the frontend
- Opens your browser

---

## What's included

| Service | URL |
|---------|-----|
| Website | http://localhost:3000 |
| Admin dashboard | http://localhost:3000/admin |
| Backend API | http://localhost:5000/api |

### Admin login
| | |
|-|-|
| Admin | admin@iyoimmo.com / Admin@2026 |
| Agent | jean@iyoimmo.com / Agent@2026 |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite, React Router v6 |
| Backend | Node.js + Express |
| Database | **NeDB** (pure JS, file-based — no install needed) |
| Auth | JWT |
| Styling | Custom CSS (IYO Immo design system) |
| Icons | Custom SVG icon system |

**No MongoDB. No PostgreSQL. No external database server.**
The database is stored as plain files in `backend/data/`. To reset, delete that folder and run `node setup.js` again.

---

## Project structure

```
iyoimmowebsite/
├── start-dev.bat          ← One-click startup
├── backend/
│   ├── data/              ← Database files (auto-created)
│   │   ├── users.db
│   │   ├── properties.db
│   │   ├── leads.db
│   │   └── team.db
│   ├── routes/            ← API routes
│   ├── middleware/        ← JWT auth
│   ├── uploads/           ← Uploaded images
│   ├── db.js              ← NeDB setup
│   ├── server.js          ← Express server
│   └── setup.js           ← DB seed (run once)
└── frontend/
    ├── public/
    │   └── logo.png        ← IYO IMMO logo
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Listings.jsx
        │   ├── PropertyDetail.jsx
        │   ├── About.jsx
        │   ├── Contact.jsx
        │   ├── Services.jsx
        │   ├── ListProperty.jsx
        │   └── admin/
        │       ├── Dashboard.jsx
        │       ├── AdminProperties.jsx
        │       ├── PropertyForm.jsx
        │       ├── AdminLeads.jsx
        │       ├── AdminTeam.jsx
        │       └── AdminSettings.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── Logo.jsx
        │   ├── PropertyCard.jsx
        │   └── icons/index.jsx
        ├── context/
        │   ├── LanguageContext.jsx  ← FR/EN toggle
        │   └── AuthContext.jsx      ← JWT auth
        └── translations/
            ├── fr.js
            └── en.js
```

## Deployment

To deploy to a VPS or shared hosting:
1. Copy the whole `iyoimmowebsite/` folder to the server
2. Run `npm install` in both `backend/` and `frontend/`
3. Build the frontend: `cd frontend && npm run build`
4. Serve the backend with PM2: `pm2 start backend/server.js --name iyoimmo`
5. Serve `frontend/dist/` with Nginx or Apache

The `backend/data/` folder contains all your data — back it up regularly.
