// Database module - currently using web storage
// For web: uses localStorage via db-web.js
// For native: will use SQLite (to be implemented when needed)

// For now, always use web database (works for web development)
export * from './db-web.js';
