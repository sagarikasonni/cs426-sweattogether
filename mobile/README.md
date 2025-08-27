# SweatTogether Mobile App

A React Native mobile version of the SweatTogether fitness partner matching app.

## Features

- **Profile Discovery**: Browse fitness profiles with ML-based matching scores
- **Smart Filtering**: Filter by level, gender, and workout preferences
- **Profile Details**: View detailed profile information and workout preferences
- **Mobile-Optimized**: Touch-friendly interface with smooth animations
- **TypeScript**: Full type safety throughout the app

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **Expo Vector Icons** for beautiful icons
- **StyleSheet** for mobile-optimized styling

## Project Structure

```
mobile/
├── App.tsx                 # Main app component with navigation
├── src/
│   └── screens/
│       ├── ExploreScreen.tsx      # Main profile discovery screen
│       └── ProfileDetailScreen.tsx # Individual profile view
├── package.json           # Dependencies and scripts
└── app.json              # Expo configuration
```

## Getting Started

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Key Components

### ExploreScreen
- Profile cards with matching scores
- Collapsible filter panel
- Real-time filtering and sorting
- Touch-friendly interactions

### ProfileDetailScreen
- Detailed profile information
- Workout preference tags
- Action buttons (Message, Connect)
- Smooth navigation

## Mobile-Specific Features

- **Touch Gestures**: Tap to view profiles, swipe to navigate
- **Responsive Design**: Adapts to different screen sizes
- **Native Feel**: Uses platform-specific shadows and animations
- **Performance**: Optimized FlatList for smooth scrolling

## Interview Talking Points

This mobile app demonstrates:
- **React Native Experience**: Built with modern React Native patterns
- **Mobile UI/UX**: Touch-friendly interface design
- **TypeScript**: Full type safety in mobile development
- **Navigation**: Complex screen navigation with React Navigation
- **State Management**: Local state with React hooks
- **Styling**: Mobile-optimized StyleSheet implementation
- **Performance**: Efficient list rendering with FlatList

## Future Enhancements

- Real-time messaging
- Push notifications
- Location-based matching
- User authentication
- Profile creation/editing
- Workout scheduling
- Social features (likes, matches)

## Screenshots

The app features:
- Clean, modern design
- Intuitive filtering system
- Profile cards with matching scores
- Detailed profile views
- Touch-optimized interactions
