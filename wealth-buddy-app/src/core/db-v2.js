import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDatabase() {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync('wealthbuddy.db');
      console.log('✓ Database opened');
    } catch (error) {
      console.error('❌ Error opening database:', error);
      throw error;
    }
  }
  return db;
}

// Initialize schema
export async function initializeSchema() {
  try {
    const database = await getDatabase();
    
    // Users table
    await database.execAsync([{
      sql: `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        salary REAL NOT NULL,
        savingsPercent REAL NOT NULL,
        bufferPercent REAL NOT NULL
      )`
    }]);

    // Categories table
    await database.execAsync([{
      sql: `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT
      )`
    }]);

    // Transactions table
    await database.execAsync([{
      sql: `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY,
        categoryId INTEGER NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        method TEXT,
        notes TEXT
      )`
    }]);

    // Recurring table
    await database.execAsync([{
      sql: `CREATE TABLE IF NOT EXISTS recurring (
        id INTEGER PRIMARY KEY,
        categoryId INTEGER NOT NULL,
        amount REAL NOT NULL,
        frequency TEXT,
        name TEXT
      )`
    }]);

    // Goals table
    await database.execAsync([{
      sql: `CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        target REAL NOT NULL,
        current REAL NOT NULL,
        deadline TEXT
      )`
    }]);

    console.log('✓ Schema created');
    return true;
  } catch (error) {
    console.error('❌ Schema error:', error);
    return false;
  }
}

// Seed sample data
export async function seedSampleData() {
  try {
    const database = await getDatabase();
    
    // Check if data already exists
    const existingUser = await database.getFirstAsync('SELECT * FROM users WHERE id = 1');
    if (existingUser) {
      console.log('✓ Sample data already exists');
      return true;
    }

    // Insert default user
    await database.runAsync(
      `INSERT INTO users (id, name, salary, savingsPercent, bufferPercent) VALUES (?, ?, ?, ?, ?)`,
      [1, 'John Doe', 5000, 15, 10]
    );

    // Insert categories
    const categories = [
      [1, 'Rent/Mortgage', 'expense', 'home'],
      [2, 'Groceries', 'expense', 'shopping-cart'],
      [3, 'Utilities', 'expense', 'flash'],
      [4, 'Transportation', 'expense', 'car'],
      [5, 'Entertainment', 'expense', 'movie'],
      [6, 'Healthcare', 'expense', 'hospital-box'],
      [7, 'Insurance', 'expense', 'shield'],
      [8, 'Other', 'expense', 'dots-horizontal'],
      [9, 'Salary', 'income', 'briefcase'],
    ];

    for (const [id, name, type, icon] of categories) {
      await database.runAsync(
        `INSERT OR IGNORE INTO categories (id, name, type, icon) VALUES (?, ?, ?, ?)`,
        [id, name, type, icon]
      );
    }

    // Insert recurring expenses
    await database.runAsync(
      `INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
      [1, 1200, 'monthly', 'Rent']
    );
    await database.runAsync(
      `INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
      [3, 150, 'monthly', 'Utilities']
    );
    await database.runAsync(
      `INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
      [7, 400, 'monthly', 'Insurance']
    );
    await database.runAsync(
      `INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
      [4, 400, 'monthly', 'Gas']
    );

    // Insert goals
    await database.runAsync(
      `INSERT INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)`,
      ['Emergency Fund', 10000, 5000, '2024-12-31']
    );
    await database.runAsync(
      `INSERT INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)`,
      ['Vacation', 3000, 800, '2024-06-30']
    );
    await database.runAsync(
      `INSERT INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)`,
      ['New Laptop', 1500, 600, '2024-09-30']
    );

    console.log('✓ Sample data seeded');
    return true;
  } catch (error) {
    console.error('❌ Seed error:', error);
    return false;
  }
}

// Get user
export async function getUser() {
  try {
    const database = await getDatabase();
    const user = await database.getFirstAsync('SELECT * FROM users WHERE id = 1');
    if (user) {
      return {
        ...user,
        salary: Number(user.salary),
        savingsPercent: Number(user.savingsPercent),
        bufferPercent: Number(user.bufferPercent),
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user:', error);
    return null;
  }
}

// Get categories
export async function getCategories() {
  try {
    const database = await getDatabase();
    const categories = await database.getAllAsync('SELECT * FROM categories ORDER BY id');
    return categories || [];
  } catch (error) {
    console.error('❌ Error getting categories:', error);
    return [];
  }
}

// Get transactions
export async function getTransactions(year, month) {
  try {
    const database = await getDatabase();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    
    const transactions = await database.getAllAsync(
      `SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC`,
      [startDate, endDate]
    );
    return (transactions || []).map(t => ({
      ...t,
      categoryId: Number(t.categoryId),
      amount: Number(t.amount),
    }));
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    return [];
  }
}

// Add transaction
export async function addTransaction(categoryId, amount, date, method = 'card', notes = '') {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)`,
      [categoryId, amount, date, method, notes]
    );
    return true;
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
    return false;
  }
}

// Delete transaction
export async function deleteTransaction(id) {
  try {
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    return false;
  }
}

// Get recurring
export async function getRecurring() {
  try {
    const database = await getDatabase();
    const recurring = await database.getAllAsync('SELECT * FROM recurring ORDER BY id');
    return (recurring || []).map(r => ({
      ...r,
      categoryId: Number(r.categoryId),
      amount: Number(r.amount),
    }));
  } catch (error) {
    console.error('❌ Error getting recurring:', error);
    return [];
  }
}

// Add recurring
export async function addRecurring(categoryId, amount, frequency, name) {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
      [categoryId, amount, frequency, name]
    );
    return true;
  } catch (error) {
    console.error('❌ Error adding recurring:', error);
    return false;
  }
}

// Delete recurring
export async function deleteRecurring(id) {
  try {
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM recurring WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error('❌ Error deleting recurring:', error);
    return false;
  }
}

// Get goals
export async function getGoals() {
  try {
    const database = await getDatabase();
    const goals = await database.getAllAsync('SELECT * FROM goals ORDER BY id');
    return (goals || []).map(g => ({
      ...g,
      target: Number(g.target),
      current: Number(g.current),
    }));
  } catch (error) {
    console.error('❌ Error getting goals:', error);
    return [];
  }
}

// Save goal
export async function saveGoal(name, target, current = 0, deadline = '') {
  try {
    const database = await getDatabase();
    const existing = await database.getFirstAsync('SELECT * FROM goals WHERE name = ?', [name]);
    
    if (existing) {
      await database.runAsync(
        `UPDATE goals SET target = ?, current = ?, deadline = ? WHERE name = ?`,
        [target, current, deadline, name]
      );
    } else {
      await database.runAsync(
        `INSERT INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)`,
        [name, target, current, deadline]
      );
    }
    return true;
  } catch (error) {
    console.error('❌ Error saving goal:', error);
    return false;
  }
}

// Delete goal
export async function deleteGoal(id) {
  try {
    const database = await getDatabase();
    await database.runAsync(`DELETE FROM goals WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    return false;
  }
}

// Calculate allocation
export function calculateAllocation(user) {
  if (!user) {
    return {
      essentials: 0,
      savings: 0,
      discretionary: 0,
      buffer: 0,
    };
  }

  const salary = Number(user.salary) || 5000;
  const savingsPercent = Number(user.savingsPercent) || 15;
  const bufferPercent = Number(user.bufferPercent) || 10;
  const essentialsPercent = 50;
  const discretionaryPercent = 100 - essentialsPercent - savingsPercent - bufferPercent;

  return {
    essentials: (salary * essentialsPercent) / 100,
    savings: (salary * savingsPercent) / 100,
    discretionary: (salary * discretionaryPercent) / 100,
    buffer: (salary * bufferPercent) / 100,
  };
}

// Update user
export async function updateUser(name, salary, savingsPercent, bufferPercent) {
  try {
    const database = await getDatabase();
    await database.runAsync(
      `UPDATE users SET name = ?, salary = ?, savingsPercent = ?, bufferPercent = ? WHERE id = 1`,
      [name, salary, savingsPercent, bufferPercent]
    );
    return true;
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return false;
  }
}

// Format money
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  const num = Number(amount);
  return `$${isNaN(num) ? '0.00' : num.toFixed(2)}`;
}
