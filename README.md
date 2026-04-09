# Kharchaaa — Finance Manager & Expense Tracker

A premium personal finance mobile app built with React Native (Expo). Dark-first fintech aesthetic, real-time insights, and fully local — no backend needed.

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
| Local data storage | ✅ | expo-sqlite (SQLite), Zustand + Immer for state |
| APK delivery | ✅ | `eas.json` configured, `android.package` set |
| GitHub README with setup steps | ✅ | This file |

### Transaction Features

- Add income or expense via the **+** button
- Fields: **amount**, **category**, **date**, **merchant / note**
- Form validation (required fields, numeric amount)
- Full **transaction list** with section headers by date (Spends tab)
- Live **search** by merchant name
- **Filter chips** by category (Food, Transport, Shopping, Health, …)

### Category Tracking

- 8 predefined categories, each with a unique icon and color
- Category breakdown card on Home showing top spenders
- Tapping a category card navigates directly to filtered Spends list
- Category percentage bars on Insights screen

### Monthly Summary

- **Total income** and **total expenses** for current month
- **Net balance** shown on the Account card (Home tab)
- Monthly bar chart on Insights (switchable Weekly / Monthly)
- Credit score gauge on Insights

### Bonus Features Implemented

| Bonus | Status |
|---|---|
| Animated bar chart | ✅ Insights tab — gifted-charts with gradient bars |
| Smart empty states | ✅ Different copy + icons for no-data vs filtered-no-results |
| Multi-currency display | ✅ Switch INR / USD / EUR / GBP / CAD in Insights → Balances |
| Balance hide / reveal | ✅ Eye icon on Account card masks all numbers |
| Onboarding | ✅ 3-slide intro on first launch, animated dot indicator |
| Credit score gauge | ✅ SVG arc speedometer on Insights |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 54 (New Architecture enabled) |
| Routing | Expo Router v6 — file-based, typed routes |
| State management | Zustand v5 + Immer |
| Local database | expo-sqlite |
| Animations | Reanimated 4, Gesture Handler |
| Charts | react-native-gifted-charts |
| Icons | HugeIcons (stroke-based) |
| Fonts | Inter via @expo-google-fonts |
| Build | EAS Build (Expo Application Services) |

---

## Project Structure

```
kharchaaa/
├── app/
│   ├── _layout.tsx            # Root layout, DB init, onboarding gate
│   ├── onboarding.tsx         # First-launch intro (3 slides)
│   ├── (tabs)/
│   │   ├── index.tsx          # Home — account card, categories, recent
│   │   ├── transactions.tsx   # Spends — search + filter + list
│   │   ├── insights.tsx       # Charts, credit gauge, currency switcher
│   │   └── profile.tsx        # User info, theme toggle, stats
│   ├── (auth)/
│   │   └── login.tsx          # Sign in / Sign up (offline-capable)
│   └── add-transaction.tsx    # Add transaction modal
├── components/                # Reusable UI components
├── constants/                 # Colors, spacing, typography tokens
├── context/                   # Theme context (dark/light)
├── hooks/                     # useCurrency, etc.
├── lib/                       # SQLite DB, services, formatters
├── store/                     # Zustand slices (transactions, UI, user)
├── eas.json                   # EAS Build profiles (preview APK, prod AAB)
└── app.json                   # Expo config (package: com.kharchaaa.app)
```

---

## Screenshots

> Run the app locally or install the APK to see the full UI.

| Home | Spends | Insights | Profile |
|---|---|---|---|
| Account card + categories | Search + filter chips | Bar chart + gauge | Stats + theme toggle |

---

## Notes

- No backend required — all data lives in SQLite on-device
- Demo transactions are seeded automatically on first launch
- Currency conversion uses fixed exchange rates (INR as base)
- Theme preference persists across sessions
- Onboarding shown once on fresh install, gated via AsyncStorage flag
