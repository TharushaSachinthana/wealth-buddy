import * as SQLite from 'expo-sqlite';

let db = null;

// Initialize or get database
export async function getDatabase() {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync('wealthbuddy.db');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
}

// Simple query execution
export async function executeQuery(sql, params = []) {
  try {
    const database = await getDatabase();
    const result = await database.execAsync([{ sql, args: params }], false);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get single row
export async function getFirstRow(sql, params = []) {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync(sql, params);
    return result || null;
  } catch (error) {
    console.error('Query error:', error);
    return null;
  }
}

// Get all rows
export async function getAllRows(sql, params = []) {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(sql, params);
    return result || [];
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

// Insert and get ID
export async function insert(sql, params = []) {
  try {
    const database = await getDatabase();
    await database.execAsync([{ sql, args: params }]);
    return true;
  } catch (error) {
    console.error('Insert error:', error);
    return false;
  }
}

// Get user
export async function getUser() {
  try {
    const user = await getFirstRow('SELECT * FROM users LIMIT 1', []);
    return user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Get categories
export async function getCategories() {
  try {
    const cats = await getAllRows('SELECT * FROM categories', []);
    return cats || [];
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

// Get transactions for month
export async function getTransactions(year, month) {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    
    const trans = await getAllRows(
      `SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC`,
      [startDate, endDate]
    );
    return trans || [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
}

// Add transaction
export async function addTransaction(categoryId, amount, date, method = 'card', notes = '') {
  try {
    const sql = `INSERT INTO transactions (categoryId, amount, date, method, notes) 
                 VALUES (?, ?, ?, ?, ?)`;
    return await insert(sql, [categoryId, amount, date, method, notes]);
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false;
  }
}

// Get recurring
export async function getRecurring() {
  try {
    const rec = await getAllRows('SELECT * FROM recurring', []);
    return rec || [];
  } catch (error) {
    console.error('Error getting recurring:', error);
    return [];
  }
}

// Get goals
export async function getGoals() {
  try {
    const goals = await getAllRows('SELECT * FROM goals', []);
    return goals || [];
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
}

// Calculate allocation
export async function calculateAllocation(user) {
  try {
    if (!user) {
      return {
        essentials: 0,
        savings: 0,
        discretionary: 0,
        buffer: 0,
      };
    }

    const salary = user.salary || 5000;
    const savingsPercent = user.savingsPercent || 15;
    const bufferPercent = user.bufferPercent || 10;
    const essentialsPercent = 50;
    const discretionaryPercent = 100 - essentialsPercent - savingsPercent - bufferPercent;

    return {
      essentials: (salary * essentialsPercent) / 100,
      savings: (salary * savingsPercent) / 100,
      discretionary: (salary * discretionaryPercent) / 100,
      buffer: (salary * bufferPercent) / 100,
    };
  } catch (error) {
    console.error('Error calculating allocation:', error);
    return { essentials: 0, savings: 0, discretionary: 0, buffer: 0 };
  }
}

// Update user settings
export async function updateUser(name, salary, savingsPercent, bufferPercent) {
  try {
    const sql = `UPDATE users SET name = ?, salary = ?, savingsPercent = ?, bufferPercent = ? WHERE id = 1`;
    return await insert(sql, [name, salary, savingsPercent, bufferPercent]);
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
}

// Add goal
export async function saveGoal(name, target, current = 0, deadline = '') {
  try {
    const existingGoal = await getFirstRow('SELECT * FROM goals WHERE name = ?', [name]);
    if (existingGoal) {
      const sql = `UPDATE goals SET target = ?, current = ?, deadline = ? WHERE name = ?`;
      return await insert(sql, [target, current, deadline, name]);
    } else {
      const sql = `INSERT INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)`;
      return await insert(sql, [name, target, current, deadline]);
    }
  } catch (error) {
    console.error('Error saving goal:', error);
    return false;
  }
}

// Delete transaction
export async function deleteTransaction(id) {
  try {
    const database = await getDatabase();
    await database.execAsync([{
      sql: `DELETE FROM transactions WHERE id = ?`,
      args: [id]
    }]);
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
}

// Add recurring
export async function addRecurring(categoryId, amount, frequency, name) {
  try {
    const database = await getDatabase();
    await database.execAsync([{
      sql: `INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)`,
      args: [categoryId, amount, frequency, name]
    }]);
    return true;
  } catch (error) {
    console.error('Error adding recurring:', error);
    return false;
  }
}

// Delete recurring
export async function deleteRecurring(id) {
  try {
    const database = await getDatabase();
    await database.execAsync([{
      sql: `DELETE FROM recurring WHERE id = ?`,
      args: [id]
    }]);
    return true;
  } catch (error) {
    console.error('Error deleting recurring:', error);
    return false;
  }
}

// Format money as currency string
export function formatMoney(amount) {
  if (!amount && amount !== 0) return '$0.00';
  return '$' + parseFloat(amount).toFixed(2);
}
