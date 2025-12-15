# Application Specification: Mood Tracker (Current State)

## 1. Executive Summary
The Mood Tracker is a cross-platform mobile application (iOS/Android/Web) built with Expo and React Native. Its primary purpose is to allow users to log their daily emotional state, visualize their mood history over time via a calendar and statistics, and maintain a consistent record across devices. The application recently transitioned to an **offline-first architecture**, prioritizing local responsiveness while synchronizing with the cloud in the background.

## 2. Technical Stack
*   **Framework**: React Native (via Expo SDK 51).
*   **Language**: JavaScript / Node.js.
*   **Authentication**: Clerk (User management, Sign-in/Sign-out).
*   **Database (Remote)**: Firebase Firestore (Source of truth for backup/sync).
*   **Database (Local)**: `@react-native-async-storage/async-storage` (Primary data source for UI).
*   **State Management**: React Context (`MoodContext`) + Custom Hooks (`useMoodData`).
*   **Navigation**: React Navigation (Stack implementation).

## 3. Core Architecture: Offline-First
The application follows an offline-first data strategy:
1.  **Reads**: The UI always reads from `AsyncStorage` (via `MoodContext`). This ensures instant load times and offline accessibility.
2.  **Writes**: User actions (e.g., logging a mood) distinctively update local state immediately (Optimistic UI) and persist to `AsyncStorage`.
3.  **Synchronization**:
    *   **Pull**: On application mount, the `SyncService` checks Firestore for data. If remote data exists, it updates local storage.
    *   **Push**: When a user updates their mood, the `SyncService` pushes the updated data to Firestore in the background.
    *   **Merge Strategy**: Currently, the latest write overwrites. (Note: A more robust timestamp-based conflict resolution is a candidate for future enhancement).

## 4. User Flows & Features

### 4.1. Onboarding & Authentication
*   **Entry Point**: `App.js` checks `Clerk` session.
*   **Unauthenticated**: Redirects to `Starter` / `SignIn` / `SignUp` screens (managed by Clerk).
*   **Authenticated**: Redirects to `Main.js` -> `Home.js`.

### 4.2. Home Screen (Dashboard)
*   **Component**: `Home.js`
*   **Key Features**:
    *   **Month Rollover Check**: On load, checks if the current month matches the stored data. If a new month has started, it archives the previous month and generates a fresh calendar structure.
    *   **Calendar View**: Displays a grid representation of the current month.
        *   **Day Cells**: Each day is a clickable cell.
        *   **Color Coding**:
            *   Grey: No data.
            *   Green: Happy (Value: 1).
            *   Yellow: Fine (Value: 2).
            *   Red: Bad Day (Value: 3).
    *   **Navigation**:
        *   Clicking a day navigates to `ChangeMood` screen for that specific date.
        *   Bottom Navigation Bar provides quick access to:
            *   Quick log "Today" (Green/Yellow/Red buttons).
            *   Stats.
            *   Sign Out.

### 4.3. Logging Moods
*   **Methods**:
    1.  **Quick Log (Bottom Bar)**: Instantly sets the mood for the *current calendar day*.
    2.  **Specific Date (Calendar Click)**: Opens `ChangeMood.js` to set the mood for a selected past/future date.
*   **Data Model**:
    *   Moods are stored as integers: `1` (Happy), `2` (Fine), `3` (Bad).
    *   Stored within a `currentMonthCalendar` array structure (weeks -> days).

### 4.4. Statistics
*   **Component**: `Stats.js`
*   **Key Features**:
    *   **Visualization**: Pie chart showing the distribution of Happy/Fine/Bad days.
    *   **Metrics**: Percentage breakdown of each mood type.
    *   **Time Frame Filtering**:
        *   1 Month (Current).
        *   3 Months, 6 Months, 12 Months, All Time (Aggregates data from `previousMonths` array in user document).
    *   **Calendar History**: Displays past monthly calendars when older time frames are selected.

## 5. Data Model (JSON Structure)
The `User` document (in AsyncStorage and Firestore `users` collection) follows this schema:

```json
{
  "username": "String",
  "email": "String",
  "createdAt": "Timestamp",
  "currentMonthYear": "String (e.g., 'January 2024')",
  "currentMonthCalendar": [
    {
      "week": [
        { "day": 1, "value": 0 }, // value: 0=Empty, 1=Happy, 2=Fine, 3=Bad
        { "day": 2, "value": 1 },
        ...
      ]
    },
    ...
  ],
  "previousMonths": [
    // Array of archived month objects similar to currentMonthCalendar
    // used for historical stats.
    {
       "monthAndYear": "December 2023",
       "monthData": [ ... ]
    }
  ]
}
```

## 6. Known Constraints / Future Improvements
*   **Conflict Resolution**: Basic overwrite strategy.
*   **UI/UX**: Simple color-coded interface. Animations and transitions are minimal.
*   **Scalability**: The `previousMonths` array grows indefinitely inside a single document, which might hit size limits eventually (though unlikely for simple text/numbers in the near term).
