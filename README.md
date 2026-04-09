# Kharchaaa — Finance Manager & Expense Tracker

A premium personal finance mobile app built with React Native (Expo). Features a dark-first fintech aesthetic, real-time insights, offline-first architecture with background sync to a cloud backend.

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) app on your phone (for quick preview)

### Run Locally

```bash
# 1. Clone the repo and enter the project
cd kharchaaa

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start
```

Scan the QR code in your terminal with **Expo Go** to open the app on your phone instantly.

> To run on Android emulator: press `a` in the terminal (requires Android Studio + an AVD).

---

## Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# Build a sideloadable APK
eas build --platform android --profile preview
```

The build link (downloadable `.apk`) will be printed when complete. Install it directly on any Android device.

---

## Feature List

### Core Requirements (All Implemented)

| Requirement | Status | Where |
|---|---|---|
| Gradient-based UI | ✅ | Account card on Home uses LinearGradient |
| Dark / Light mode toggle | ✅ | Profile tab → Theme toggle, persisted via AsyncStorage |
| Bottom Tab Navigation (4 tabs) | ✅ | Home · Spends · Insights · Profile |
| Animations & micro-interactions | ✅ | Reanimated 4 throughout — tab bar, modals, add button, charts |
| Keyboard handling | ✅ | Add Transaction & Login forms — KeyboardAvoidingView + smooth scroll |
| Local data storage (offline-first) | ✅ | expo-sqlite (SQLite), Zustand + Immer for state |
| Background sync to cloud | ✅ | Sync service queues changes, syncs when online |
| APK delivery | ✅ | `eas.json` configured, `android.package` set |
| GitHub README with setup steps | ✅ | This file |

### Transaction Features

| Requirement | Status |
|---|---|
| Add income / expense | ✅ |
| Fields: amount, category, date, note | ✅ |
| Form validation | ✅ |
| Category-based tracking | ✅ |
| Predefined/custom categories | ✅ (8 predefined with icons/colors) |
| Visual distinction (icons/colors) | ✅ |

### Monthly Summary

| Requirement | Status |
|---|---|
| Total income | ✅ |
| Total expenses | ✅ |
| Remaining balance | ✅ |

### Backend & Sync Architecture

| Feature | Status |
|---|---|
| Offline-first (all features work locally) | ✅ |
| Background sync to cloud backend | ✅ |
| Real user authentication (JWT) | ✅ |
| Cloud data persistence | ✅ (Neon PostgreSQL) |
| Auto-sync on login | ✅ |
| Stop sync on logout | ✅ |

### Bonus Features Implemented

| Bonus | Status |
|---|---|
| Animated bar chart | ✅ Insights tab — gifted-charts with gradient bars |
| Smart empty states | ✅ Different copy + icons for no-data vs filtered-no-results |
| Multi-currency display | ✅ Switch INR / USD / EUR / GBP / CAD in Insights → Balances |
| Balance hide / reveal | ✅ Eye icon on Account card masks all numbers |
| Onboarding | ✅ 3-slide intro on first launch, animated dot indicator |
| Credit score gauge | ✅ SVG arc speedometer on Insights |
| Bank account management | ✅ Add multiple accounts, color-coded, live preview |
| Transaction source tracking | ✅ Manual, SMS, Email, Import |

---

## Tech Stack

### Mobile App (kharchaaa)

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 54 (New Architecture enabled) |
| Routing | Expo Router v6 — file-based, typed routes |
| State management | Zustand v5 + Immer |
| Local database | expo-sqlite (SQLite) |
| Secure storage | expo-secure-store (auth tokens) |
| Animations | Reanimated 4, Gesture Handler |
| Charts | react-native-gifted-charts |
| Icons | HugeIcons (stroke-based) |
| Fonts | Inter via @expo-google-fonts |
| Build | EAS Build (Expo Application Services) |
| Network | @react-native-community/netinfo |

### Backend (kharchaabackend)

| Layer | Choice |
|---|---|
| Runtime | Node.js + Express.js |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) |
| Security | Helmet, CORS, Rate limiting |
| Validation | Zod |
| Hosting | Render.com |

### Admin Panel (kharchaaadmin)

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Deployment | Vercel |
| UI | Tailwind CSS + shadcn/ui |

---

## Project Structure

### Mobile App (kharchaaa)

```
kharchaaa/
├── app/
│   ├── _layout.tsx            # Root layout, DB init, auth gate, sync manager
│   ├── onboarding.tsx         # First-launch intro (3 slides)
│   ├── (tabs)/
│   │   ├── index.tsx          # Home — account cards, categories, recent
│   │   ├── transactions.tsx   # Spends — search + filter + list
│   │   ├── insights.tsx       # Charts, credit gauge, currency switcher
│   │   └── profile.tsx        # User info, theme toggle, stats, logout
│   ├── (auth)/
│   │   └── login.tsx          # Sign in / Sign up with backend auth
│   ├── add-transaction.tsx    # Add transaction modal
│   └── add-account.tsx        # Add bank account modal
├── components/                # Reusable UI components
├── constants/                 # Colors, spacing, typography tokens
├── context/                   # Theme context (dark/light)
├── hooks/                     # useCurrency, useThemeMode
├── lib/
│   ├── db/                    # SQLite DB, repositories, migrations
│   ├── services/              # Sync service, transaction service, category service
│   └── mock-data/             # Demo data, formatters
├── store/                     # Zustand slices (transactions, UI, user, accounts)
├── eas.json                   # EAS Build profiles (preview APK, prod AAB)
└── app.json                   # Expo config (package: com.kharchaaa.app)
```

### Backend (kharchaabackend)

```
kharchaabackend/
├── src/
│   ├── controllers/           # Auth, Sync, Transactions, Analytics
│   ├── routes/                # Express routers
│   ├── services/              # Business logic (auth, transactions)
│   ├── middleware/            # Auth, rate limiting, error handling
│   ├── utils/                 # Prisma client, category seeder
│   └── server.ts              # Entry point
├── prisma/
│   ├── schema.prisma          # Data models (User, Transaction, Category)
│   └── migrations/            # Database migrations
├── render.yaml                # Render deployment config
└── package.json
```

### Admin Panel (kharchaaadmin)

```
kharchaaadmin/
├── src/
│   ├── app/                   # Next.js App Router pages
│   └── components/            # React components
├── vercel.json                # Vercel deployment config
└── package.json
```

---

## Screenshots

> Run the app locally or install the APK to see the full UI.

| Home | Spends | Insights | Profile |
|---|---|---|---|
| Account cards + categories | Search + filter chips | Bar chart + gauge | Stats + theme toggle |

---

## Offline-First Architecture

Kharchaaa uses an offline-first approach:

1. **All data is stored locally first** using SQLite (expo-sqlite)
2. **Immediate UI updates** — no waiting for network
3. **Background sync** — changes are queued and synced to the cloud when online
4. **Conflict resolution** — local changes take precedence
5. **Works without internet** — full app functionality even when offline

### How Sync Works

```
User adds transaction
    ↓
Saved to SQLite (instant)
    ↓
Queued for sync
    ↓
Background sync checks connection
    ↓
If online → Push to backend API
    ↓
Backend stores in PostgreSQL
    ↓
Periodic pull fetches remote changes
```

---

## Deployment

### Backend (Render)

1. Push code to `kharchaabackend` GitHub repo
2. Create new Web Service on Render
3. Set build command: `npm install && npm run build`
4. Set start command: `node dist/server.js`
5. Add environment variables:
   - `DATABASE_URL` (Neon pooler URL)
   - `DIRECT_URL` (Neon non-pooler URL for migrations)
   - `JWT_ACCESS_SECRET` (64-char random hex)
   - `JWT_REFRESH_SECRET` (64-char random hex)
   - `CORS_ORIGIN` (comma-separated origins)

### Admin Panel (Vercel)

1. Push code to `kharchaaadmin` GitHub repo
2. Import project in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` (Render backend URL)
4. Deploy

### Mobile App

1. Update `.env` with backend URL:
   ```
   EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
2. Build APK:
   ```
   eas build --platform android --profile preview
   ```

---

## Notes

- Offline-first — all features work without internet
- Background sync keeps cloud data up to date
- Demo transactions seeded for "Continue without account" users
- Real auth (JWT) for registered users with cloud sync
- Currency conversion uses fixed exchange rates (INR as base)
- Theme preference persists across sessions
- Onboarding shown once on fresh install, gated via AsyncStorage flag

---

## Assignment Compliance

This app fulfills all requirements from the Finance Manager Assignment:

✅ **Gradient-based UI** — LinearGradient on account cards, logo, buttons
✅ **Dark/Light mode** — Full theme system with toggle
✅ **Bottom Tab Navigation** — 4 tabs (Home, Spends, Insights, Profile)
✅ **Animations** — Reanimated 4 for all transitions and micro-interactions
✅ **Keyboard handling** — Smooth forms with KeyboardAvoidingView
✅ **Local storage** — SQLite for all transaction data
✅ **APK delivery** — EAS Build configured for preview/production
✅ **GitHub README** — This comprehensive documentation
✅ **Transaction management** — Add income/expense with validation
✅ **Category tracking** — 8 categories with icons and colors
✅ **Monthly summary** — Income, expenses, net balance

**Bonus features added:**
- Bank account management with color-coded cards
- Background cloud sync (offline-first)
- Credit score gauge visualization
- Multi-currency support
- Smart empty states
- Balance hide/reveal toggle
