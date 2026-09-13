# LIFE RPG — Backend Engine & REST API

Production-ready, persistent, server-authoritative gamification and progression backend for **LIFE RPG**.

Turn mundane real-world tasks into measurable RPG progression with non-linear XP leveling, attribute radar metrics, consecutive-day streak tracking, a virtual bazaar economy, milestone achievements, and anti-cheat validation.

---

## 1. Architectural Overview

```
                    LIFE RPG
                       │
                React Frontend
                       │
                    REST API (/api)
                       │
                       ▼
                Node + Express
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 Authentication   Quest Engine     Reward Engine
       │               │                │
  Google OAuth         │         Bazaar & Gear
       │               │                │
       │  ┌────────────┼─────────────┐  │
       │  ▼            ▼             ▼  │
       │ XP         Streaks      Attributes
       │  │            │             │  │
       │  └────────────┼─────────────┘  │
       │               ▼                │
       │         Level Engine           │
       │               │                │
       │        ┌──────┼──────┐         │
       │        ▼      ▼      ▼         │
       │     Gold  Achievements Inventory
       │        │      │      │         │
       │        └──────┼──────┘         │
       │               ▼                │
       │        Activity History        │
       │               │                │
       │        Calendar Service        │
       │               │                │
       └───────────────┼────────────────┘
                       ▼
     Supabase PostgreSQL / Persistent Store
```

### Key Technical Pillars
- **Layered Clean Architecture**: Strict separation between Routes, Controllers, Domain Services, and Data Store.
- **Strict Level 0 Baseline**: Every newly registered user (email/password or Google OAuth) begins at:
  - Level 0
  - 100 starter Gold
  - 0 current XP / 0 total XP
  - 0 active streak / 0 best streak
  - 0 completed quests
  - 0 unlocked achievements
  - Empty inventory
  - All progress telemetry starting at 0
- **Server-Authoritative Progression**: All mathematical formulas (XP curve, Gold rewards, attribute gains, streaks, level-ups) are computed strictly on the backend. Client progression manipulation is impossible.
- **Single Active Day Streak Rules**:
  - Completing the 1st quest on day 1 sets streak to 1.
  - Completing 2, 5, or 10 quests on the same day maintains streak at 1 (1 active day).
  - Completing a quest on consecutive day increments streak to 2.
  - Missed day resets current streak to 1 upon next completion, while preserving `bestStreak` monotonically.
- **True Persistence**:
  - **Production Mode (`NODE_ENV=production`)**: Strictly connects to live Supabase / PostgreSQL. Startup fails clearly if database configuration is missing.
  - **Development Mode (`NODE_ENV=development`)**: Connects to Supabase / PostgreSQL if configured, and simultaneously mirrors state to `backend/data/rpg_store.json` on disk, guaranteeing that user accounts, quests, completions, XP, Gold, attributes, streaks, achievements, and inventory survive restarts and page refreshes.
- **Strict User Data Isolation**: Every protected route verifies JWT authentication and restricts data access strictly to `req.user.id`. Access to other users' entities yields `HTTP 404 / 403`.
- **Expandable Avatar System**: Supports `avatar-01` through `avatar-24`. Profile updates validate avatar format via regex `^avatar-\d{2,}$` and reject arbitrary external URLs or script injections.
- **Google Calendar 3-State Integration**: Tracks `NOT_CONNECTED`, `CONNECTED`, and `REAUTHORIZATION_REQUIRED` states, providing isolated mock time blocks when connected and empty arrays when disconnected.

---

## 2. Requirements & Environment

- **Node.js**: `v20.x` or `v22.x`+ (Tested on `v24.20.0`)
- **Package Manager**: npm `v10.x`+
- **Database**: PostgreSQL 14+ / Supabase PostgreSQL (optional in development with persistent disk storage)

---

## 3. Installation & Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env
```

### Environment Variables (`.env`)

```ini
PORT=5000
NODE_ENV=development

# PostgreSQL / Supabase Credentials
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Authentication
JWT_SECRET=liferpg_dev_jwt_secret_key_84920492817293_ultra_secure

# CORS Allowed Origin
FRONTEND_URL=http://localhost:5173
```

---

## 4. Database Migrations & Seeding

```bash
# Run PostgreSQL migrations
npm run db:migrate

# Seed initial bazaar rewards, achievements, and starter quests
npm run db:seed
```

> **Note**: Seeding populates only reference bazaar items, achievements, and template starter quests. No fake user history or inflated stats exist. Every new player earns their progression through real task completion.

---

## 5. Running the Backend

```bash
# Development mode with hot-reload (tsx watch)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## 6. Testing & Quality Assurance

Run the comprehensive 13-suite automated verification tests:

```bash
npm test
```

### Tested Capabilities
1. **Health Check**: `/api/health` status, database connection telemetry, and uptime.
2. **Registration & Strict Level 0 Baseline**: Verified Level 0, 100 Gold, 0 XP, 0 streak, 0 achievements, empty inventory, and duplicate email prevention.
3. **Google OAuth Integration**: POST `/api/auth/google` links or creates users with Level 0 baseline and valid JWT.
4. **Profile Security & Avatar Validation**: Validates `avatar-01` to `avatar-24`, rejects external URLs with HTTP 400, and ignores stat tampering attempts.
5. **Strict User Isolation**: User B is blocked from viewing, editing, completing, or deleting User A's quests (`HTTP 404 Not Found`).
6. **Authoritative Quest Completion & Rewards**: Server-assigned XP (+250 for Epic), Gold (+120), attributes, and duplicate completion prevention (`ALREADY_COMPLETED`).
7. **Streak Mechanics & Single Active Day Enforcement**: Multiple quests on the same day maintain streak count (1 active day rule).
8. **Monthly Activity Matrix & Progress Telemetry**: `GET /api/streaks/monthly` returns calendar day array with `isToday`, `completed`, and consistency rate; `GET /api/progress` returns velocity metrics.
9. **Non-Linear Level Progression**: Cumulative XP triggers level-up transitions and grants attribute points.
10. **Virtual Bazaar Economy**: Gold balance checks, level requirements, duplicate purchase prevention, and inventory equip/unequip.
11. **Milestones & Achievements**: Automatic condition evaluation (First Quest, 7-Day Streak, Code Warrior) and claimable rewards with duplicate claim prevention.
12. **Google Calendar 3-State Lifecycle**: Validates `NOT_CONNECTED`, `CONNECTED`, `REAUTHORIZATION_REQUIRED`, and `disconnect` flows.
13. **Restart Persistence**: Proves all progress, character stats, and completed quest states survive server restart and disk reload.

---

## 7. API Endpoints Reference

All endpoints are prefixed with `/api`.

### Health & Telemetry
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Backend health, database status, timestamp | Public |

### Authentication (`/api/auth`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new adventurer dossier (Level 0 baseline) | Public |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT | Public |
| `POST` | `/api/auth/google` | Google OAuth identity authentication/linking | Public |
| `POST` | `/api/auth/logout` | Terminate session safely | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Required |

### Quests (`/api/quests`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/quests` | List user quests (filters: status, category, difficulty) | Required |
| `POST` | `/api/quests` | Commission a new quest | Required |
| `GET` | `/api/quests/history` | Historical completed quests log | Required |
| `GET` | `/api/quests/:id` | Get quest details (user-scoped) | Required |
| `PATCH` | `/api/quests/:id` | Update quest details | Required |
| `DELETE` | `/api/quests/:id` | Decommission quest | Required |
| `POST` | `/api/quests/:id/complete` | Complete quest (awards XP, Gold, Attributes, Streaks) | Required |

### Character & Attributes (`/api/character`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/character` | Full character sheet, level, total XP, gold, equipment | Required |
| `GET` | `/api/character/attributes` | 5 attributes radar stats (STR, INT, VIT, DIS, CHA) | Required |
| `PATCH` | `/api/character` | Safe character metadata updates | Required |
| `POST` | `/api/character/attributes/allocate` | Spend attribute points to boost a specific stat | Required |

### Progression (`/api/progression`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/progression` | Non-linear XP progression overview, percentage, milestones | Required |
| `GET` | `/api/progression/history` | 7-day rolling cadence activity | Required |

### Progress Intelligence Telemetry (`/api/progress`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/progress` | Empirical velocity metrics: weekly/monthly XP, daily distributions, reliability | Required |

### Streaks & Activity (`/api/streaks`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/streaks` | Current streak, best streak, freezes, milestones | Required |
| `GET` | `/api/streaks/monthly` | Full calendar month activity matrix, active days, consistency rate | Required |

### Virtual Bazaar & Rewards (`/api/rewards`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/rewards` | List available rewards catalog with owned/equipped status | Required |
| `POST` | `/api/rewards/:id/purchase` | Purchase reward with Gold (atomic transaction) | Required |

### Vault / Inventory (`/api/inventory`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/inventory` | List owned inventory items | Required |
| `POST` | `/api/inventory/:id/equip` | Equip item into designated gear slot | Required |
| `POST` | `/api/inventory/:id/unequip` | Unequip item | Required |

### Hall of Milestones (`/api/achievements`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/achievements` | List achievements with progress and unlock status | Required |
| `POST` | `/api/achievements/:id/claim` | Claim achievement reward (+XP, +Gold) | Required |

### Google Calendar Integration (`/api/calendar`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/calendar/status` | Connection status (`NOT_CONNECTED`, `CONNECTED`, `REAUTHORIZATION_REQUIRED`) | Required |
| `POST` | `/api/calendar/connect` | Connect calendar with account email | Required |
| `POST` | `/api/calendar/disconnect` | Disconnect calendar | Required |
| `POST` | `/api/calendar/reauthorize` | Set connection status to reauthorization required | Required |
| `GET` | `/api/calendar/events` | Retrieve isolated schedule blocks | Required |

### Transmission Telemetry (`/api/notifications`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/notifications` | List user notification queue | Required |
| `PATCH` | `/api/notifications/:id/read` | Mark transmission as read | Required |
| `DELETE` | `/api/notifications` | Clear all transmissions | Required |

### Historical Audit Feed (`/api/activity`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/activity` | Chronological activity log | Required |

### Adventurer Dossier (`/api/profile`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/profile` | Public adventurer profile | Required |
| `PATCH` | `/api/profile` | Update profile bio, class title, timezone, or avatar (`avatar-01` to `avatar-24`) | Required |

### Daily Missions (`/api/missions`)
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/api/missions/today` | Retrieve today's daily focus missions | Required |

---

## 8. Non-Linear Progression Math

$$XP_{\text{required}}(\text{level}) = \text{round}\left(100 \times 1.35^{\text{level} - 1}\right)$$

- **Level 0**: Baseline (0 XP)
- **Level 1**: 100 XP
- **Level 2**: 135 XP
- **Level 3**: 182 XP
- **Level 4**: 246 XP
- **Level 5**: 332 XP
- **Level 10**: 1,489 XP
- **Level 14**: 4,942 XP

### Authoritative Difficulty Tiers
| Difficulty | XP Awarded | Gold Awarded | Attribute Gain |
|---|---|---|---|
| `trivial` | +20 XP | +10 Gold | +5 |
| `easy` | +40 XP | +20 Gold | +10 |
| `medium` | +70 XP | +35 Gold | +18 |
| `hard` | +120 XP | +60 Gold | +30 |
| `epic` | +250 XP | +120 Gold | +60 |

---

## 9. Troubleshooting

- **Server fails on startup in production**: Ensure `DATABASE_URL` is set in `.env` or production environment. The server protects data integrity by failing fast if a production database is missing.
- **Port already in use**: If port 5000 is occupied, adjust `PORT=5001` in `.env` and set `VITE_API_URL=http://localhost:5001/api` in frontend.
- **Testing in offline mode**: The backend automatically uses `backend/data/rpg_store.json` for persistence when a live PostgreSQL instance is not reachable, enabling seamless offline demoing.

---

## 10. Google Integration Architecture & Comprehensive Setup Guide

LIFE RPG implements two separate, architecturally distinct Google integrations with least-privilege principles and zero secret leakage to the client:

1. **Google Sign-In**: Powered by **Supabase Auth** (`supabase.auth.signInWithOAuth({ provider: 'google' })`). Provides frictionless, passwordless authentication. New accounts start with the strict Level 0 baseline (0 XP, 100 Gold, 0 streak, empty inventory). Returning users reuse their existing account with zero duplicates.
2. **Google Calendar**: Powered by a **direct backend OAuth 2.0 flow** on the Express server. Requested independently and optionally via explicit user consent with the minimum read-only scope (`https://www.googleapis.com/auth/calendar.events.readonly`). Supports full token refresh, revocation, and user-isolated event fetching without converting calendar events into quests.

---

### A. Where to Configure Google Sign-In in Supabase

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. In the left navigation menu, go to **Authentication** > **Providers**.
3. Locate **Google** in the provider list and toggle it to **Enabled**.
4. Paste your **Client ID** and **Client Secret** (obtained from Google Cloud Console in Step B below).
5. Copy the **Callback URL (for OAuth)** shown in the Supabase Google provider settings. It looks like:
   `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
6. Click **Save**.

---

### B. Where to Find the Google Client ID and Secret

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a Google Cloud Project (e.g., `life-rpg-production`).
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. If prompted, configure your **OAuth consent screen**:
   - User Type: **External**
   - App Name: `LIFE RPG`
   - User Support Email: your developer or admin email
   - Developer Contact Information: your email
   - Authorized Domains: add `supabase.co` and your production domain
   - Click **Save and Continue**.
6. Back under **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: `LIFE RPG Client`
7. Once created, a modal will display:
   - **Client ID** (e.g., `1234567890-abcdef.apps.googleusercontent.com`)
   - **Client Secret** (e.g., `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`)
8. Note: You can retrieve these credentials anytime from **APIs & Services** > **Credentials**.

---

### C. Which Redirect URIs Must Be Configured in Google Cloud Console

In your Google Cloud Console Web OAuth Client settings (**Authorized redirect URIs**), you must register the following exact URIs:

#### 1. For Supabase Google Sign-In:
- `https://<your-project-id>.supabase.co/auth/v1/callback`

#### 2. For Google Calendar Backend OAuth 2.0:
- **Local Development**:
  - `http://localhost:5000/api/calendar/callback`
- **Production**:
  - `https://api.your-liferpg-domain.com/api/calendar/callback` (or your production Express backend URL)

#### 3. Authorized JavaScript Origins:
- **Local Development**:
  - `http://localhost:5173` (Frontend)
  - `http://localhost:5000` (Backend)
- **Production**:
  - `https://your-liferpg-domain.com`
  - `https://api.your-liferpg-domain.com`

---

### D. Which Scopes Are Required for Google Calendar

The calendar integration adheres strictly to the **Principle of Least Privilege**.
The only scope requested is:
```
https://www.googleapis.com/auth/calendar.events.readonly
```
- **Why this scope?**: It grants read-only permission to read upcoming events so adventurers can visualize their focus blocks. It does **not** grant permission to modify, delete, or manage calendars.
- **Enable the API in Google Cloud**:
  1. In Google Cloud Console, navigate to **APIs & Services** > **Library**.
  2. Search for **Google Calendar API**.
  3. Click **Enable**.

---

### E. How to Set Frontend and Backend Environment Variables

#### 1. Frontend (`.env` in repository root `/`):
The frontend requires only client-safe, public configuration. **NEVER** place Google client secrets or database connection strings here!
```ini
# API Gateway
VITE_API_URL=http://localhost:5000/api

# Supabase Auth Client Configuration (Safe for Browser)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Backend (`backend/.env`):
All sensitive secrets remain strictly on the backend:
```ini
PORT=5000
NODE_ENV=development

# JWT Secret for Session Signing
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# Frontend Base URL (for CORS & Calendar OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Optional Supabase / PostgreSQL Connection
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Calendar OAuth 2.0 (Server-Side Secrets ONLY)
GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar.events.readonly
```

---

### F. Why Google Calendar Requires a Separate OAuth Consent Screen

1. **Least-Privilege Security Isolation**:
   - Requesting sensitive scopes like Google Calendar access during initial user registration creates unnecessary friction, distrust, and high drop-off rates.
   - Users should be able to play LIFE RPG without connecting their calendar. Calendar sync is completely optional.
2. **Token Security & Lifecycle**:
   - Supabase Auth manages user identity sessions (JWTs).
   - Google Calendar integration requires long-lived offline refresh tokens (`access_type=offline`) specifically for the Google Calendar API, which must be stored securely on the backend and refreshed server-to-server.
3. **Graceful Revocation & Reauthorization**:
   - If an adventurer revokes calendar permissions in their Google Account Security settings, their LIFE RPG account remains completely active and untouched. The calendar service simply transitions to `REAUTHORIZATION_REQUIRED` without terminating the user's game session.

---

### G. How to Run and Test Both Features Locally

#### 1. Automated Verification:
Run the comprehensive 13-suite automated test battery:
```bash
cd backend
npm test
```
The test suite validates:
- Google user Level 0 baseline (0 XP, 100 Gold, 0 streak, 0 completed quests)
- Returning Google user account reuse (prevents duplicates)
- Linking Google ID to existing email account
- Calendar 3-state lifecycle (`NOT_CONNECTED` -> `CONNECTED` -> `REAUTHORIZATION_REQUIRED` -> `NOT_CONNECTED`)
- Strict user calendar isolation (User B cannot read User A's calendar)
- Calendar events never automatically converting into completed quests

#### 2. Local Manual Testing:
1. Start Backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Start Frontend:
   ```bash
   npm run dev
   ```
3. Test Google Sign-In:
   - Navigate to `http://localhost:5173/login` or `http://localhost:5173/register`.
   - Click **"Continue with Google"**.
   - Authenticate on Google's consent screen.
   - You are redirected to `/auth/callback` which validates the session, provisions a Level 0 account, sets the JWT, and opens `/dashboard`.
4. Test Google Calendar:
   - Go to **Settings** (`/settings`) or **Profile** (`/profile`).
   - Find the **Google Calendar Sync** section (initially `NOT_CONNECTED`).
   - Click **"Connect Google Calendar"**.
   - Grant read-only calendar access on Google's consent screen.
   - Google redirects to `http://localhost:5000/api/calendar/callback`, which exchanges tokens, stores them, and redirects back to `/settings?calendar=connected`.
   - Read-only calendar events are now displayed.
   - Click **"Disconnect"** to revoke access and clear stored tokens.

---

### H. How to Deploy Both Features in Production Without Exposing Secrets

1. **Client-Side Secret Shielding**:
   - The Vite frontend bundle will never contain `GOOGLE_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, or `DATABASE_URL`.
   - Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are built into the client bundle (these are safe for browser exposure by Supabase design).
2. **Production Environment Variables**:
   - On your production hosting provider (e.g. Render, Railway, Vercel, AWS ECS), configure:
     - `FRONTEND_URL=https://liferpg.app`
     - `GOOGLE_REDIRECT_URI=https://api.liferpg.app/api/calendar/callback`
     - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as environment variables.
3. **Google Cloud Console Production Whitelist**:
   - Update your OAuth Client ID in Google Cloud Console to add production URLs:
     - Authorized JavaScript Origins: `https://liferpg.app`, `https://api.liferpg.app`
     - Authorized Redirect URIs: `https://<supabase-id>.supabase.co/auth/v1/callback` and `https://api.liferpg.app/api/calendar/callback`
4. **Publish OAuth Consent Screen**:
   - For public users outside your Google Workspace organization, submit your app for Google Verification in Google Cloud Console under **OAuth consent screen** > **Publish App**.

