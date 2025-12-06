import { getDatabase, executeQuery } from './simpleDb';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary REAL NOT NULL,
  savingsPercent REAL NOT NULL,
  bufferPercent REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  categoryId INTEGER NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  method TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS recurring (
  id INTEGER PRIMARY KEY,
  categoryId INTEGER NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  target REAL NOT NULL,
  current REAL NOT NULL,
  deadline TEXT
);

CREATE TABLE IF NOT EXISTS monthly_allocations (
  id INTEGER PRIMARY KEY,
  userId INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  essentials REAL,
  savings REAL,
  discretionary REAL,
  buffer REAL
);
`;

export async function initializeDatabase() {
  try {
    const db = await getDatabase();
    
    // Execute all schema statements
    const statements = SCHEMA.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execAsync([{ sql: statement }]);
      }
    }
    
    console.log('✓ Database initialized');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

export async function seedSampleData() {
  try {
    const db = await getDatabase();
    
    // Insert default user
    await db.execAsync([{
      sql: `INSERT OR IGNORE INTO users (id, name, salary, savingsPercent, bufferPercent) 
            VALUES (1, ?, ?, ?, ?)`,
      args: ['John Doe', 5000, 15, 10]
    }]);

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

    for (const [name, type, icon] of categories) {
      await db.execAsync([{
        sql: `INSERT OR IGNORE INTO categories (name, type, icon) VALUES (?, ?, ?)`,
        args: [name, type, icon]
      }]);
    }

    // Insert sample recurring expenses
    const recurring = [
      [1, 1200, 'monthly', 'Rent'],
      [3, 150, 'monthly', 'Utilities'],
      [7, 400, 'monthly', 'Insurance'],
      [4, 400, 'monthly', 'Gas'],
    ];

    for (const [catId, amount, freq, name] of recurring) {
      await db.execAsync([{
        sql: `INSERT OR IGNORE INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
        args: [catId, amount, freq, name]
      }]);
    }

    // Insert sample goals
    const goals = [
      ['Emergency Fund', 10000, 5000, '2024-12-31'],
      ['Vacation', 3000, 800, '2024-06-30'],
      ['New Laptop', 1500, 600, '2024-09-30'],
    ];

    for (const [name, target, current, deadline] of goals) {
      await db.execAsync([{
        sql: `INSERT OR IGNORE INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)`,
        args: [name, target, current, deadline]
      }]);
    }

    console.log('✓ Sample data seeded');
    return true;
  } catch (error) {
    console.error('Seeding error:', error);
    return false;
  }
}
