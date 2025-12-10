# Wealth Buddy - Developer Guide

Welcome to the **Wealth Buddy** developer documentation. This guide provides a comprehensive overview of the application's architecture, database management, features, and instructions for running and deploying the app.

## 1. Technology Stack

The application is built using the following core technologies:

-   **Framework**: [React Native](https://reactnative.dev/) (v0.75.1) with [Expo](https://expo.dev/) (SDK 54).
-   **Navigation**: [React Navigation](https://reactnavigation.org/) (v6).
-   **UI Library**: [React Native Paper](https://callstack.github.io/react-native-paper/) (v5) + Custom Theme System.
-   **State Management**: React Context API (`AppContext`).
-   **Database**:
    -   **Web**: LocalStorage (via custom adapter).
    -   **Mobile**: SQLite (via `expo-sqlite`, ready for implementation).
-   **Charts**: `victory-native` (with fallback to custom CSS/View-based charts).

## 2. Project Architecture

The project follows a modular structure:

```
src/
├── context/         # React Context providers (State Management)
│   ├── AppContext-v2.js  # Main application state (transactions, user, goals)
├── core/            # Core business logic and database adapters
│   ├── db-v2.js          # Database entry point (adapter)
│   ├── db-web.js         # Web implementation (LocalStorage)
│   └── (future native db modules)
├── navigation/      # Navigation configuration
│   └── RootNavigator.js  # Tab and Stack navigators
├── screens/         # UI Screens
│   ├── DashboardScreen-modern.js
│   ├── QuickAddScreen.js
│   ├── CalendarScreen.js
│   └── ...
├── theme.js         # Centralized design system (Colors, Shadows, Typography)
└── utils/           # Helper functions (CSV Export, etc.)
```

### Data Flow

1.  **Context Layer**: `AppContext-v2.js` initializes the database connection and loads all data into the application state (`user`, `transactions`, `goals`, etc.).
2.  **Service Layer**: Components call methods exposed by `AppContext` (e.g., `addTransaction`).
3.  **Data Layer**: The Context converts these calls to database operations via `src/core/db-v2.js`.
4.  **Persistence**: `db-v2.js` delegates to `db-web.js` (for web) or native modules to persist changes.
5.  **Reactivity**: After a successful write, the Context re-fetches data (`loadAll()`), updating the state and causing UI components to re-render.

## 3. Database Management

The application currently uses a **Mock/Web-first Database** approach for rapid development and web compatibility.

### Web Implementation (`src/core/db-web.js`)
-   Uses browser `localStorage` to persist data.
-   Keys: `wb_users`, `wb_transactions`, `wb_categories`, `wb_recurring`, `wb_goals`.
-   Data is stored as JSON strings.

### Data Schema
-   **User**: `{ id, name, salary, savingsPercent, bufferPercent }`
-   **Transaction**: `{ id, categoryId, amount, date (YYYY-MM-DD), method, notes }`
-   **Category**: `{ id, name, type (income/expense), icon }`

> **Note**: To reset data in development, you can clear the browser's Local Storage.

## 4. Key Features & Modules

### Dashboard (`DashboardScreen-modern.js`)
-   Displays Income, Expense, and Net Balance summaries.
-   Visualizes spending using Pie Charts and Bar Charts.
-   Shows budget allocation based on the 50/30/20 rule (customized via Settings).

### Quick Add (`QuickAddScreen.js`)
-   Allows users to quickly record Income or Expenses.
-   Updates the database and redirects to Dashboard.

### Calendar (`CalendarScreen.js`)
-   Provides a monthly view of transactions.
-   Interactive dates to see daily spending.

### Recurring (`RecurringScreen.js`)
-   Manage fixed expenses (Rent, Subscriptions).
-   (Future) Automated entry generation.

### Goals (`GoalsScreen.js`)
-   Track savings targets.
-   Visual progress bars and "Time to Goal" estimates.

## 5. Running & Deployment

### Prerequisites
-   Node.js (LTS)
-   npm or yarn

### Installation
```bash
npm install
```

### Running the App
-   **Web**:
    ```bash
    npm run web
    ```
    Runs on port `8082` by default.

-   **Android/iOS**:
    ```bash
    npm run android
    # or
    npm run ios
    ```
    Requires Android Studio/Xcode or Expo Go app on a physical device.

### Building for Production
-   **Web**:
    ```bash
    npx expo export:web
    ```
    Generates static files in `web-build` directory.

## 6. Troubleshooting

-   **"Metro Bundler" issues**: Run `npx expo start -c` to clear cache.
-   **Database not updating**: Ensure `AppContext` is wrapping the application in `App.js`.
-   **Navigation errors**: Verify `RootNavigator` is correctly nested in `NavigationContainer`.

---
*Maintained by Wealth Buddy Team*
