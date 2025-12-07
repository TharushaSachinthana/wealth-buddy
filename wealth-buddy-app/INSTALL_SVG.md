# Fix: Install react-native-svg

The app needs `react-native-svg` for Victory charts to work. 

## Quick Fix:

Run this command in your terminal:

```bash
npm install react-native-svg
```

Or if you're using Expo:

```bash
npx expo install react-native-svg
```

After installation, restart the development server:

```bash
npm start
```

## Note:

The app will work without charts (using fallback UI), but charts will be much better! The fallback UI still looks modern and functional.

