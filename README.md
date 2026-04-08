# Kharchaaa — Personal Finance Tracker

A premium React Native expense tracking app built with Expo, featuring a dark-first design, real-time insights, and multi-currency support.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 54 (New Architecture) |
| Routing | Expo Router v6 (file-based) |
| State | Zustand v5 + Immer |
| Database | expo-sqlite (local-first) |
| Animations | Reanimated 4 + Gesture Handler |
| Charts | react-native-gifted-charts |
| Icons | HugeIcons |
| Fonts | Inter (via @expo-google-fonts) |

## Features

- **Dashboard** — Account card with balance, category breakdown, recent transactions
- **Spends** — Full transaction list with live search + category filter chips
- **Insights** — Monthly bar chart, credit score gauge, currency switcher, category breakdown
- **Profile** — User info, net flow stats, theme toggle (dark/light)
- **Add Transaction** — Modal form with category picker, amount, merchant, date
- **Onboarding** — 3-slide intro on first launch, skippable
- **Multi-currency** — Switch display currency (INR / USD / EUR / GBP / CAD), all amounts stored in INR
- **Hide balance** — Eye toggle on account card to mask sensitive numbers

## Running Locally

```bash
cd kharchaaa
npm install
npx expo start
```

Scan the QR with **Expo Go** (iOS/Android) or press `a` for Android emulator.

> Requires Node 18+ and the Expo CLI (`npm i -g expo-cli`).

## Building the APK

### Prerequisites

```bash
npm install -g eas-cli
eas login
```

### Development APK (sideload)

```bash
eas build --platform android --profile preview
```

This produces a `.apk` you can install directly on any Android device.

### Production AAB (Play Store)

```bash
eas build --platform android --profile production
```

## Project Structure

```
kharchaaa/
├── app/
│   ├── _layout.tsx          # Root layout, DB init, onboarding gate
│   ├── onboarding.tsx        # First-run intro slides
│   ├── (tabs)/              # Main tab screens
│   │   ├── index.tsx        # Dashboard / Home
│   │   ├── transactions.tsx # Spends list + filter
│   │   ├── insights.tsx     # Charts + analytics
│   │   └── profile.tsx      # User profile
│   ├── (auth)/              # Auth screens
│   │   └── login.tsx        # Sign in / Sign up
│   └── add-transaction.tsx  # Add transaction modal
├── components/              # Shared UI components
├── constants/               # Colors, tokens, typography
├── context/                 # Theme context
├── hooks/                   # useCurrency, etc.
├── lib/                     # DB, services, format utils
├── store/                   # Zustand slices
└── eas.json                 # EAS Build profiles
```

## Notes

- All data is stored locally via SQLite — no backend required to run
- Demo data is seeded on first launch via `MOCK_TRANSACTIONS`
- Currency conversion uses fixed exchange rates (INR base)
- Theme preference persists across sessions via AsyncStorage
