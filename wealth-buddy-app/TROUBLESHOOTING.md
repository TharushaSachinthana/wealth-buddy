# Troubleshooting Web App

## If you see a blank page:

1. **Open Browser Console (F12)** and check for errors
2. **Check the Network tab** - make sure `index.bundle` loads successfully (200 status)
3. **Try these steps:**

### Step 1: Check Browser Console
Press F12 → Console tab → Look for red errors

Common errors:
- `localStorage is not defined` → Should be fixed now
- `Cannot read property of undefined` → Component error
- `Module not found` → Import error

### Step 2: Clear Browser Data
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Refresh page

### Step 3: Check if Bundle Loads
In Network tab, look for:
- `index.bundle?platform=web` → Should be 200 OK
- If 500 error → Check terminal for build errors
- If 404 → Server not running properly

### Step 4: Check Terminal Output
Look for:
- "Web is waiting on http://localhost:8081"
- Any red error messages
- Build completion messages

## Common Issues:

### Blank White Page
- **Cause:** JavaScript error preventing render
- **Fix:** Check browser console, fix the error

### "Cannot read property" errors
- **Cause:** Component trying to access undefined data
- **Fix:** Add null checks in components

### localStorage errors
- **Cause:** SSR or browser restrictions
- **Fix:** Should be fixed with safety checks

## Still Having Issues?

1. Share the **browser console errors** (F12 → Console)
2. Share the **terminal output** from Expo
3. Share a **screenshot** of what you see

The app should work now with the localStorage safety checks!

