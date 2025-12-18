# Mood Tracker Application

[![React Native](https://img.shields.io/badge/React_Native-0.72.4-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK_49-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-3A85D3?logo=clerk&logoColor=white)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: iOS & Android](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-000000?logo=apple&logoColor=white)](https://reactnative.dev/)

A modern, cross-platform mobile application for tracking your mood and emotional well-being over time. Built with React Native, TypeScript, and Firebase, this app helps users log their daily moods, add notes, and visualize their emotional patterns through insightful analytics.


<img width="350" height="1600" alt="image" src="https://github.com/user-attachments/assets/f03e2259-be5c-4889-bb80-53daefbea96e" />
<img width="350" height="1600" alt="image" src="https://github.com/user-attachments/assets/af06eb77-0f5c-48fb-9b0d-de748aa11ebb" />
<img width="350" height="1600" alt="image" src="https://github.com/user-attachments/assets/9a19d5a1-96fe-481d-88cf-860494e085bd" />
<img width="350" height="1600" alt="image" src="https://github.com/user-attachments/assets/a6eb5d33-2c47-480c-a707-3a2b1e05ffa9" />


## 🌟 Features

### 📝 Mood Logging
- Rate your mood on a scale from 1-5 with emoji indicators
- Add custom tags to provide context (e.g., "Happy", "Stressed", "Tired")
- Include optional notes with each mood entry
- View and edit previous mood entries

### 📊 Analytics Dashboard
- Visual mood history with charts
- Mood distribution analysis
- Streak tracking to maintain consistency
- Tag frequency and correlation insights
- Time-based filtering (7d, 30d, 3m, 6m, 1y, all time)

### 🎨 Personalization
- Light and dark theme support
- Customizable user profile
- Responsive design that works on phones and tablets

### 🔐 Secure Authentication
- Email/password authentication
- Secure data storage with Firebase
- Protected user sessions

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Routing and navigation
- **React Native Paper** - UI component library
- **React Native Reanimated** - Smooth animations
- **React Native Gifted Charts** - Data visualization

### Backend
- **Firebase Authentication** - User management
- **Firestore** - Real-time database

### State Management & Data Fetching
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Development Tools
- **Expo** - Development workflow
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vimscientist69/Mood-Tracker-Application.git
   cd Mood-Tracker-Application
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - set the following values:
     ```
     EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
     EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

4. Start the development server:
   ```bash
   npx expo start
   ```

## 📱 Running the App

### iOS
```bash
npx expo run:ios
```

### Android
```bash
npx expo run:android
```

### Web
```bash
npx expo start --web
```

## 🧪 Testing

Run the test suite:
```bash
npm run test
# or
yarn test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/) for the amazing cross-platform framework
- [Expo](https://expo.dev/) for simplifying the development workflow
- [Firebase](https://firebase.google.com/) for backend services
- All the open-source libraries used in this project

---

Built with ❤️ by vimscientist69
