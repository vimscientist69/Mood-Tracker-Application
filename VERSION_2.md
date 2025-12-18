# Mood Tracker Application: Version 2 Roadmap

This document outlines the critique of the current application (Version 1) and details the technical and functional specification for the complete rewrite (Version 2).

---

## Part 1: Current Limitations & Areas for Improvement (Critique)

The current application (v1), while functional, suffers from significant architectural, scalability, and user experience issues. The following areas have been identified for overhaul:

### 1. User Interface & Experience (UI/UX)

- **Problem**: The UI is rudimentary, utilizing "inline styles hell" with inconsistent spacing, typography, and colors. It lacks a cohesive design language.
- **Improvement**: Adopt a robust Design System (e.g., **React Native Paper** for Material Design or **Tamagui**).
  - Use a standardized Theme Provider for colors, typography, and spacing.
  - Implement consistent accessible components (Buttons, Inputs, Cards).
  - Add micro-interactions and animations (using `react-native-reanimated`) to make the app feel "alive".

### 2. Navigation Structure

- **Problem**: The "Bottom Navigation Bar" is a custom-built view hardcoded into each screen, violating standard navigation patterns. It improperly hosts "Action Buttons" (Mood Logging) mixed with navigation.
- **Improvement**: Implement standard **Tab Navigation** via `react-navigation`.
  - **Tabs**: Home, Analytics, Settings.
  - **Actions**: Move Mood Logging to a **Floating Action Button (FAB)** on the Home screen or a central "Add" tab that opens a modal/bottom sheet.
  - **Settings**: Move Logout and Profile management to a dedicated Settings screen.

### 3. Usage of Custom implementations over Libraries

- **Problem (Calendar)**: The calendar is a manually calculated 2D array, which is error-prone, hard to maintain, and lacks accessibility/advanced features.
- **Improvement**: Integrate **`react-native-calendars`** (by Wix). It offers highly customizable, performant, and feature-rich calendar components out of the box.

### 4. Authentication Flow

- **Problem**: The current flow works but lacks polish. Error handling is logged to the console rather than displayed to the user.
- **Improvement**: Rebuild the Auth Flow using Clerk (or Firebase Auth) with best practices:
  - Form validation (Zod/React Hook Form) for email/password.
  - User-friendly error messages (Toast/Snackbar) for login failures.
  - Loading skeletons/spinners during auth states.

### 5. Web Responsiveness

- **Problem**: The app is designed primarily for mobile dimensions. On web, it looks like a stretched mobile view.
- **Improvement**: Utilize `react-native-web` effectively with responsive layouts.
  - Use Grid layouts or `Flexbox` that adapts to screen width.
  - Ensure navigation patterns make sense on Desktop (e.g., Sidebar vs Bottom Tabs).

### 6. Code Quality & Architecture

- **Problem**:
  - **Prop Drilling**: Heavy reliance on passing props through multiple layers.
  - **God Components**: `Main.js` and `Home.js` handle too much logic (fetching, processing, rendering).
  - **Duplication**: Date calculation logic is repeated across components.
- **Improvement**:
  - **TypeScript**: Migrating to TypeScript is non-negotiable for type safety and developer experience.
  - **Clean Code**: Enforce ESLint/Prettier principles. Break down components into atoms/molecules.
  - **DRY**: Extract utility functions (date helpers, formatting) into a shared `utils` folder.

### 7. State Management

- **Problem**: Reliance on local component state and a basic Context API mixed with direct DB calls.
- **Improvement**: Adopt a proven state management library.
  - **Global Client State**: **Redux Toolkit** (standard, scalable) or **Zustand** (simpler, lighter).
  - **Server State**: Consider **TanStack Query (React Query)** for caching remote data, determining loading states, and handling background refetches efficiently.

### 8. Data Structure & Scalability (Critical)

- **Problem**: The current schema stores _all_ mood history in a single User document (`previousMonths` array).
  - **Risk**: Firestore documents have a 1MB limit. A long-term user will eventually crash the app.
  - **Inefficiency**: Fetching the user profile fetches _entire_ history, which is wasteful.
- **Improvement**: Relational Data Modeling in NoSQL.
  - `users` collection: Stores only profile info (settings, preferences).
  - `mood_logs` sub-collection: Each day/log is a separate document (or monthly document). This allows infinite scalability and efficient querying (e.g., "Get logs for Jan 2025").

---

## Part 2: Version 2 Specification

### 1. Technology Stack

- **Core**: React Native (Expo SDK Latest), TypeScript.
- **UI Library**: React Native Paper (Material Design) or Tamagui.
- **Navigation**: React Navigation (Native Stack + Bottom Tabs).
- **State Management**: Zustand (for global app state) + TanStack Query (for data fetching).
- **Backend**: Firebase (Firestore, Auth, Cloud Functions).
- **Forms**: React Hook Form + Zod.

### 2. Core Features & User Stories

#### Authentication

- User can sign up/login via Email/Password or Social Providers (Google/Apple).
- User receives clear feedback on errors.
- User session persists securely.

#### Home Dashboard

- **Header**: Welcome message, Date, Streak counter.
- **Calendar View**:
  - Month view using `react-native-calendars`.
  - Days color-coded by mood.
  - Clicking a day opens the "Log Mood" interface for that day.
- **FAB**: "Check-in" button to log the current moment's mood.

#### Mood Logging (The "Check-in")

- **UI**: Bottom Sheet or Modal.
- **Inputs**:
  - **Mood**: Slider or Face Icons (1-5 scale).
  - **Feelings/Tags**: multiselect chips (e.g., "Anxious", "Excited", "Tired").
  - **Note**: Text area for journaling.
  - **Date/Time**: Defaults to now, editable.

#### Analytics (Stats)

- **Charts**:
  - Mood Flow (Line chart over time).
  - Distribution (Pie chart of mood counts).
  - Correlation (Tags vs Mood).
- **Filtering**: Last 7 days, Month, Year, Custom Range.

#### Settings

- Theme Toggle (Dark/Light).
- Notification Reminders (e.g., "How was your day?" at 8 PM).
- Data Management (Export JSON, Delete Account).
- Logout.

### 3. Data Schema (Firestore)

#### Collection: `users`

Document ID: `userId`

```json
{
  "displayName": "John Doe",
  "email": "john@example.com",
  "photoURL": "https://...",
  "createdAt": "Timestamp",
  "preferences": {
    "theme": "system", // light, dark, system
    "reminderTime": "20:00"
  },
  "stats": {
    "currentStreak": 5,
    "lastLogDate": "2025-01-01"
  }
}
```

#### Collection: `users/{userId}/mood_logs`

Document ID: `YYYY-MM-DD` (Ensures one log per day if daily restricted, or uuid if multiple allowed)

```json
{
  "date": "2025-01-01", // searchable String
  "timestamp": "Timestamp", // for sorting
  "moodRating": 4, // Integer 1-5
  "tags": ["productive", "gym"],
  "note": "Had a great workout session.",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### 4. Implementation Steps (Phased)

1.  **Phase 1: Foundation**: Initialize Expo with TypeScript, set up ESLint/Prettier, install UI Library and Navigation.
2.  **Phase 2: Authentication**: Implement robust auth screens and state.
3.  **Phase 3: Data Layer**: Create Firestore hooks (useMood, useLogs) using TanStack Query.
4.  **Phase 4: Core UI**:
    - Implement Tab Navigator.
    - Build Home Screen with Calendar integration.
    - Build Mood Logging Modal.
5.  **Phase 5: Analytics**: Implement charts based on queried data.
6.  **Phase 6: Polish**: Animations, Theme toggling, Offline persistence (React Query persistence), Web responsiveness adjustments.
