import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('wealthbuddy.db');

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT DEFAULT 'John Doe',
  salary REAL DEFAULT 5000,
  savingsPercent REAL DEFAULT 15,
  bufferPercent REAL DEFAULT 10
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  categoryId INTEGER NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  method TEXT,
  notes TEXT,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring (
  id INTEGER PRIMARY KEY,
  categoryId INTEGER NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT,
  name TEXT,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  target REAL NOT NULL,
  current REAL DEFAULT 0,
  deadline TEXT
);

-- Monthly allocations table
CREATE TABLE IF NOT EXISTS monthly_allocations (
  id INTEGER PRIMARY KEY,
  userId INTEGER DEFAULT 1,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  essentials REAL,
  savings REAL,
  discretionary REAL,
  buffer REAL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`;

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Create tables
      const statements = schema.split(';').filter((s) => s.trim().length > 0);
      statements.forEach((statement) => {
        tx.executeSql(statement + ';');
      });

      // Insert default user
      tx.executeSql(
        'INSERT OR IGNORE INTO users (id, name, salary, savingsPercent, bufferPercent) VALUES (1, ?, ?, ?, ?)',
        ['John Doe', 5000, 15, 10]
      );

      // Insert categories
      const categories = [
        ['Rent/Mortgage', 'expense', 'home'],
        ['Groceries', 'expense', 'shopping-cart'],
        ['Utilities', 'expense', 'flash'],
        ['Transportation', 'expense', 'car'],
        ['Entertainment', 'expense', 'movie'],
        ['Healthcare', 'expense', 'hospital-box'],
        ['Insurance', 'expense', 'shield'],
        ['Other', 'expense', 'dots-horizontal'],
        ['Salary', 'income', 'briefcase'],
      ];

      categories.forEach(([name, type, icon]) => {
        tx.executeSql(
          'INSERT OR IGNORE INTO categories (name, type, icon) VALUES (?, ?, ?)',
          [name, type, icon]
        );
      });
    }, reject, resolve);
  });
}

export async function seedSampleData() {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      // Add recurring expenses
      tx.executeSql(
        'INSERT OR IGNORE INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)',
        [1, 1200, 'monthly', 'Rent']
      );
      tx.executeSql(
        'INSERT OR IGNORE INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)',
        [3, 150, 'monthly', 'Utilities']
      );
      tx.executeSql(
        'INSERT OR IGNORE INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)',
        [7, 400, 'monthly', 'Insurance']
      );
      tx.executeSql(
        'INSERT OR IGNORE INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)',
        [4, 400, 'monthly', 'Gas & Transport']
      );

      // Add sample transactions
      tx.executeSql('INSERT OR IGNORE INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)', [
        2,
        -120.5,
        `${year}-${String(month).padStart(2, '0')}-01`,
        'card',
        'Weekly groceries',
      ]);
      tx.executeSql('INSERT OR IGNORE INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)', [
        5,
        -45.99,
        `${year}-${String(month).padStart(2, '0')}-02`,
        'card',
        'Movie night',
      ]);
      tx.executeSql('INSERT OR IGNORE INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)', [
        2,
        -95.75,
        `${year}-${String(month).padStart(2, '0')}-03`,
        'card',
        'Groceries shopping',
      ]);
      tx.executeSql('INSERT OR IGNORE INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)', [
        9,
        5000,
        `${year}-${String(month).padStart(2, '0')}-05`,
        'bank',
        'Monthly salary',
      ]);
      tx.executeSql('INSERT OR IGNORE INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)', [
        6,
        -35.0,
        `${year}-${String(month).padStart(2, '0')}-07`,
        'card',
        'Doctor checkup',
      ]);

      // Add sample goals
      tx.executeSql('INSERT OR IGNORE INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)', [
        'Emergency Fund',
        10000,
        5000,
        '2025-12-31',
      ]);
      tx.executeSql('INSERT OR IGNORE INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)', [
        'Vacation',
        3000,
        800,
        '2024-07-31',
      ]);
      tx.executeSql('INSERT OR IGNORE INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)', [
        'New Laptop',
        1500,
        600,
        '2024-12-31',
      ]);
    }, reject, resolve);
  });
}
