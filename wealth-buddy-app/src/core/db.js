import * as SQLite from 'expo-sqlite';

let db = null;

// Initialize database
async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('wealthbuddy.db');
  }
  return db;
}

/**
 * Run a query with parameters
 */
async function runAsync(sql, params = []) {
  const database = await getDb();
  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
}

/**
 * Get all results from a query
 */
async function getAllAsync(sql, params = []) {
  const result = await runAsync(sql, params);
  return result.rows._array;
}

/**
 * Get first result from a query
 */
async function getFirstAsync(sql, params = []) {
  const results = await getAllAsync(sql, params);
  return results.length > 0 ? results[0] : null;
}

// ============ USER FUNCTIONS ============

export async function getUser() {
  return getFirstAsync('SELECT * FROM users WHERE id = 1');
}

export async function updateUser(name, salary, savingsPercent, bufferPercent) {
  return runAsync(
    'UPDATE users SET name = ?, salary = ?, savingsPercent = ?, bufferPercent = ? WHERE id = 1',
    [name, salary, savingsPercent, bufferPercent]
  );
}

// ============ CATEGORY FUNCTIONS ============

export async function getCategories() {
  return getAllAsync('SELECT * FROM categories ORDER BY name');
}

export async function getCategoriesByType(type) {
  return getAllAsync('SELECT * FROM categories WHERE type = ? ORDER BY name', [type]);
}

// ============ TRANSACTION FUNCTIONS ============

export async function getTransactions(year, month) {
  return getAllAsync(
    'SELECT * FROM transactions WHERE CAST(strftime("%Y", date) AS INTEGER) = ? AND CAST(strftime("%m", date) AS INTEGER) = ? ORDER BY date DESC',
    [year, month]
  );
}

export async function getTransactionsByCategory(categoryId) {
  return getAllAsync('SELECT * FROM transactions WHERE categoryId = ? ORDER BY date DESC', [
    categoryId,
  ]);
}

export async function addTransaction(categoryId, amount, date, method, notes) {
  return runAsync(
    'INSERT INTO transactions (categoryId, amount, date, method, notes) VALUES (?, ?, ?, ?, ?)',
    [categoryId, amount, date, method, notes]
  );
}

export async function deleteTransaction(id) {
  return runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// ============ RECURRING FUNCTIONS ============

export async function getRecurring() {
  return getAllAsync('SELECT * FROM recurring ORDER BY name');
}

export async function addRecurring(categoryId, amount, frequency, name) {
  return runAsync(
    'INSERT INTO recurring (categoryId, amount, frequency, name) VALUES (?, ?, ?, ?)',
    [categoryId, amount, frequency, name]
  );
}

export async function deleteRecurring(id) {
  return runAsync('DELETE FROM recurring WHERE id = ?', [id]);
}

// ============ GOAL FUNCTIONS ============

export async function getGoals() {
  return getAllAsync('SELECT * FROM goals ORDER BY name');
}

export async function saveGoal(id, name, target, current, deadline) {
  if (!id) {
    // Insert new
    return runAsync(
      'INSERT INTO goals (name, target, current, deadline) VALUES (?, ?, ?, ?)',
      [name, target, current, deadline]
    );
  } else {
    // Update existing
    return runAsync(
      'UPDATE goals SET name = ?, target = ?, current = ?, deadline = ? WHERE id = ?',
      [name, target, current, deadline, id]
    );
  }
}

export async function deleteGoal(id) {
  return runAsync('DELETE FROM goals WHERE id = ?', [id]);
}

// ============ ALLOCATION FUNCTIONS ============

export async function getMonthlyAllocation(year, month) {
  return getFirstAsync(
    'SELECT * FROM monthly_allocations WHERE year = ? AND month = ? AND userId = 1',
    [year, month]
  );
}

export async function saveMonthlyAllocation(year, month, essentials, savings, discretionary, buffer) {
  const existing = await getMonthlyAllocation(year, month);
  if (existing) {
    return runAsync(
      'UPDATE monthly_allocations SET essentials = ?, savings = ?, discretionary = ?, buffer = ? WHERE year = ? AND month = ? AND userId = 1',
      [essentials, savings, discretionary, buffer, year, month]
    );
  } else {
    return runAsync(
      'INSERT INTO monthly_allocations (userId, year, month, essentials, savings, discretionary, buffer) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, year, month, essentials, savings, discretionary, buffer]
    );
  }
}

// ============ CALCULATED FUNCTIONS ============

export async function calculateAllocation() {
  const user = await getUser();
  if (!user) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const recurring = await getRecurring();
  const recurringTotal = recurring.reduce((sum, r) => sum + (r.amount || 0), 0);

  const available = user.salary - recurringTotal;

  const allocation = {
    essentials: available * 0.5,
    savings: available * (user.savingsPercent / 100),
    discretionary: available * 0.3,
    buffer: available * (user.bufferPercent / 100),
  };

  await saveMonthlyAllocation(year, month, allocation.essentials, allocation.savings, allocation.discretionary, allocation.buffer);

  return allocation;
}

export async function getMonthlyTotals(year, month) {
  const transactions = await getTransactions(year, month);
  const recurring = await getRecurring();

  const totals = {
    income: 0,
    expenses: 0,
    byCategory: {},
  };

  transactions.forEach((t) => {
    const category = t.categoryId;
    if (!totals.byCategory[category]) totals.byCategory[category] = 0;

    if (t.amount > 0) {
      totals.income += t.amount;
    } else {
      totals.expenses += Math.abs(t.amount);
      totals.byCategory[category] += Math.abs(t.amount);
    }
  });

  return totals;
}
