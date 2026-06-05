# 🌿 LifeUp — Personal Development Mobile App

A full-stack mobile-first personal development app built with:
- **Frontend:** React + Vite (mobile-optimized UI)
- **Backend:** Flask (Python REST API)
- **Database:** SQLite via SQLAlchemy (upgradeable to PostgreSQL)
- **Auth:** JWT tokens

---

## 📱 Features

| Module | Features |
|---|---|
| 🏠 Dashboard | Life score, pillars, today's overview, quick actions |
| 🫀 Health | Steps, water, sleep, calories, weight, workout tracking |
| ✅ Habits | Daily habit tracker with streaks, 7-day view, categories |
| 🎯 Goals | Goals with progress sliders, categories, completion & XP |
| 😊 Mood | Daily mood + energy + journal entry, 14-day history |
| 💰 Finance | Income/expense tracker, savings rate, monthly summary |
| 📔 Notes | Diary, ideas, tasks, moments, gratitude — all in one |

---

## 🚀 How to Run

### 1. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
# → runs on http://localhost:5000
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
# → opens http://localhost:5173
```

### 3. Open in browser

Go to `http://localhost:5173` in Chrome.

To test on your **mobile phone**:
1. Make sure your phone is on the same WiFi
2. Find your laptop IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Open `http://YOUR_LAPTOP_IP:5173` on your phone
4. In Chrome on Android → Menu → "Add to Home Screen" for app-like experience

---

## 🗄️ Database

SQLite database file is auto-created at `backend/lifeup.db` on first run.

### Tables:
- `users` — accounts, level, XP
- `mood_entries` — daily mood, energy, journal
- `habits` + `habit_logs` — habit definitions and daily logs
- `goals` — goals with progress tracking
- `health_logs` — daily health metrics
- `finance_entries` — income and expenses
- `notes` — diary, ideas, tasks, moments

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, get JWT token |
| GET | `/api/dashboard` | Full dashboard data |
| GET/POST | `/api/mood` | Get/save mood entries |
| GET/POST | `/api/habits` | Get/add habits |
| POST | `/api/habits/:id/toggle` | Toggle habit done today |
| GET/POST | `/api/goals` | Get/add goals |
| PUT | `/api/goals/:id` | Update goal progress |
| GET/POST | `/api/health` | Get/save health logs |
| GET/POST | `/api/finance` | Get/add finance entries |
| GET/POST | `/api/notes` | Get/save notes |

All endpoints (except register/login) require: `Authorization: Bearer <token>`

---

## 📂 Project Structure

```
lifeUp/
├── backend/
│   ├── app.py          ← Flask app, all API routes
│   ├── models.py       ← SQLAlchemy database models
│   ├── requirements.txt
│   └── lifeup.db       ← auto-created SQLite database
│
└── frontend/
    ├── src/
    │   ├── App.jsx             ← Root app with auth + routing
    │   ├── main.jsx
    │   ├── components/
    │   │   └── UI.jsx          ← Shared components (Card, Btn, Ring, etc.)
    │   ├── hooks/
    │   │   └── useAuth.jsx     ← Auth context
    │   ├── lib/
    │   │   └── api.js          ← Axios API client
    │   └── pages/
    │       ├── AuthPage.jsx    ← Login & Register
    │       ├── Dashboard.jsx   ← Main dashboard
    │       ├── HealthPage.jsx  ← Health tracking
    │       ├── HabitsPage.jsx  ← Habit tracker
    │       ├── GoalsPage.jsx   ← Goals & dreams
    │       └── MorePage.jsx    ← Mood + Finance + Notes
    ├── index.html
    └── vite.config.js
```

---

## 🌐 Deploy to Production

### Backend (PythonAnywhere — free):
1. Upload `backend/` folder
2. Set up WSGI pointing to `app.py`
3. Install requirements via pip

### Frontend (Vercel — free):
1. Push `frontend/` to GitHub
2. Connect repo to vercel.com
3. Add env var: `VITE_API_URL=https://your-pythonanywhere-url.com/api`
4. Update `src/lib/api.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## 🎓 Tech Stack Learning Path

If you're learning this stack:

1. **Python basics** → variables, functions, classes (1-2 weeks)
2. **Flask** → routes, JSON responses, SQLAlchemy (1 week) — `flask.palletsprojects.com`
3. **JavaScript basics** → ES6, promises, fetch (1-2 weeks)
4. **React** → components, useState, useEffect, props (2-3 weeks) — `react.dev`
5. **SQL** → SELECT, INSERT, JOIN, foreign keys (1 week) — `sqlitetutorial.net`

