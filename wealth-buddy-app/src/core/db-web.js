// Web-compatible database using localStorage (no dependencies needed)

const STORAGE_KEYS = {
  users: 'wb_users',
  categories: 'wb_categories',
  transactions: 'wb_transactions',
  recurring: 'wb_recurring',
  goals: 'wb_goals',
};

// Check if localStorage is available (for SSR safety)
const isLocalStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

function getStorage(key) {
  if (!isLocalStorageAvailable) {
    console.warn('localStorage not available, returning empty array');
    return [];
  }
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return [];
  }
}

function setStorage(key, data) {
  if (!isLocalStorageAvailable) {
    console.warn('localStorage not available, cannot save data');
    return false;
  }
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
}

export function getDatabase() {
  // Return a mock database object for compatibility
  return {
    isWeb: true,
  };
}

// Initialize schema
export async function initializeSchema() {
  try {
    if (!isLocalStorageAvailable) {
      console.warn('localStorage not available, skipping initialization');
      return false;
    }
    // Initialize empty arrays if they don't exist
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
      setStorage(STORAGE_KEYS.users, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.categories)) {
      setStorage(STORAGE_KEYS.categories, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.transactions)) {
      setStorage(STORAGE_KEYS.transactions, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.recurring)) {
      setStorage(STORAGE_KEYS.recurring, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.goals)) {
      setStorage(STORAGE_KEYS.goals, []);
    }
    console.log('✓ Database initialized (localStorage)');
    return true;
  } catch (error) {
    console.error('❌ Schema error:', error);
    return false;
  }
}

// Seed sample data
export async function seedSampleData() {
  try {
    const existingUser = getStorage(STORAGE_KEYS.users).find(u => u.id === 1);
    if (existingUser) {
      console.log('✓ Sample data already exists');
      return true;
    }

    // Insert default user
    const users = [{ id: 1, name: 'John Doe', salary: 5000, savingsPercent: 15, bufferPercent: 10 }];
    setStorage(STORAGE_KEYS.users, users);

    // Insert categories
    const categories = [
      { id: 1, name: 'Rent/Mortgage', type: 'expense', icon: 'home' },
      { id: 2, name: 'Groceries', type: 'expense', icon: 'shopping-cart' },
      { id: 3, name: 'Utilities', type: 'expense', icon: 'flash' },
      { id: 4, name: 'Transportation', type: 'expense', icon: 'car' },
      { id: 5, name: 'Entertainment', type: 'expense', icon: 'movie' },
      { id: 6, name: 'Healthcare', type: 'expense', icon: 'hospital-box' },
      { id: 7, name: 'Insurance', type: 'expense', icon: 'shield' },
      { id: 8, name: 'Other', type: 'expense', icon: 'dots-horizontal' },
      { id: 9, name: 'Salary', type: 'income', icon: 'briefcase' },
    ];
    setStorage(STORAGE_KEYS.categories, categories);

    // Insert recurring expenses
    const recurring = [
      { id: 1, categoryId: 1, amount: 1200, frequency: 'monthly', name: 'Rent' },
      { id: 2, categoryId: 3, amount: 150, frequency: 'monthly', name: 'Utilities' },
      { id: 3, categoryId: 7, amount: 400, frequency: 'monthly', name: 'Insurance' },
      { id: 4, categoryId: 4, amount: 400, frequency: 'monthly', name: 'Gas' },
    ];
    setStorage(STORAGE_KEYS.recurring, recurring);

    // Insert goals
    const goals = [
      { id: 1, name: 'Emergency Fund', target: 10000, current: 5000, deadline: '2024-12-31' },
      { id: 2, name: 'Vacation', target: 3000, current: 800, deadline: '2024-06-30' },
      { id: 3, name: 'New Laptop', target: 1500, current: 600, deadline: '2024-09-30' },
    ];
    setStorage(STORAGE_KEYS.goals, goals);

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
    const users = getStorage(STORAGE_KEYS.users);
    const user = users.find(u => u.id === 1);
    if (user) {
      return {
        ...user,
        salary: Number(user.salary) || 0,
        savingsPercent: Number(user.savingsPercent) || 0,
        bufferPercent: Number(user.bufferPercent) || 0,
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
    const categories = getStorage(STORAGE_KEYS.categories);
    return (categories || []).map(cat => ({
      ...cat,
      id: Number(cat.id) || 0,
    }));
  } catch (error) {
    console.error('❌ Error getting categories:', error);
    return [];
  }
}

// Get transactions
export async function getTransactions(year, month) {
  try {
    const transactions = getStorage(STORAGE_KEYS.transactions);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    
    const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate);
    
    return (filtered || []).map(t => ({
      ...t,
      id: Number(t.id) || 0,
      categoryId: Number(t.categoryId) || 0,
      amount: Number(t.amount) || 0,
    }));
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    return [];
  }
}

// Add transaction
export async function addTransaction(categoryId, amount, date, method = 'card', notes = '') {
  try {
    const transactions = getStorage(STORAGE_KEYS.transactions);
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id || 0)) + 1 : 1;
    transactions.push({
      id: newId,
      categoryId: Number(categoryId),
      amount: Number(amount),
      date: String(date),
      method: String(method),
      notes: String(notes),
    });
    setStorage(STORAGE_KEYS.transactions, transactions);
    return true;
  } catch (error) {
    console.error('❌ Error adding transaction:', error);
    return false;
  }
}

// Delete transaction
export async function deleteTransaction(id) {
  try {
    const transactions = getStorage(STORAGE_KEYS.transactions);
    const filtered = transactions.filter(t => Number(t.id) !== Number(id));
    setStorage(STORAGE_KEYS.transactions, filtered);
    return true;
  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    return false;
  }
}

// Get recurring
export async function getRecurring() {
  try {
    const recurring = getStorage(STORAGE_KEYS.recurring);
    return (recurring || []).map(r => ({
      ...r,
      id: Number(r.id) || 0,
      categoryId: Number(r.categoryId) || 0,
      amount: Number(r.amount) || 0,
    }));
  } catch (error) {
    console.error('❌ Error getting recurring:', error);
    return [];
  }
}

// Add recurring
export async function addRecurring(categoryId, amount, frequency, name) {
  try {
    const recurring = getStorage(STORAGE_KEYS.recurring);
    const newId = recurring.length > 0 ? Math.max(...recurring.map(r => r.id || 0)) + 1 : 1;
    recurring.push({
      id: newId,
      categoryId: Number(categoryId),
      amount: Number(amount),
      frequency: String(frequency),
      name: String(name),
    });
    setStorage(STORAGE_KEYS.recurring, recurring);
    return true;
  } catch (error) {
    console.error('❌ Error adding recurring:', error);
    return false;
  }
}

// Delete recurring
export async function deleteRecurring(id) {
  try {
    const recurring = getStorage(STORAGE_KEYS.recurring);
    const filtered = recurring.filter(r => Number(r.id) !== Number(id));
    setStorage(STORAGE_KEYS.recurring, filtered);
    return true;
  } catch (error) {
    console.error('❌ Error deleting recurring:', error);
    return false;
  }
}

// Get goals
export async function getGoals() {
  try {
    const goals = getStorage(STORAGE_KEYS.goals);
    return (goals || []).map(g => ({
      ...g,
      id: Number(g.id) || 0,
      target: Number(g.target) || 0,
      current: Number(g.current) || 0,
    }));
  } catch (error) {
    console.error('❌ Error getting goals:', error);
    return [];
  }
}

// Save goal
export async function saveGoal(name, target, current = 0, deadline = '') {
  try {
    const goals = getStorage(STORAGE_KEYS.goals);
    const existing = goals.find(g => g.name === name);
    
    if (existing) {
      const updated = goals.map(g => 
        g.name === name 
          ? { ...g, target: Number(target), current: Number(current), deadline: String(deadline) }
          : g
      );
      setStorage(STORAGE_KEYS.goals, updated);
    } else {
      const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id || 0)) + 1 : 1;
      goals.push({
        id: newId,
        name: String(name),
        target: Number(target),
        current: Number(current),
        deadline: String(deadline),
      });
      setStorage(STORAGE_KEYS.goals, goals);
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
    const goals = getStorage(STORAGE_KEYS.goals);
    const filtered = goals.filter(g => Number(g.id) !== Number(id));
    setStorage(STORAGE_KEYS.goals, filtered);
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
    essentials: Number((salary * essentialsPercent) / 100) || 0,
    savings: Number((salary * savingsPercent) / 100) || 0,
    discretionary: Number((salary * discretionaryPercent) / 100) || 0,
    buffer: Number((salary * bufferPercent) / 100) || 0,
  };
}

// Update user
export async function updateUser(name, salary, savingsPercent, bufferPercent) {
  try {
    const users = getStorage(STORAGE_KEYS.users);
    const updated = users.map(u => 
      u.id === 1 
        ? { ...u, name: String(name), salary: Number(salary), savingsPercent: Number(savingsPercent), bufferPercent: Number(bufferPercent) }
        : u
    );
    if (!users.find(u => u.id === 1)) {
      updated.push({ id: 1, name: String(name), salary: Number(salary), savingsPercent: Number(savingsPercent), bufferPercent: Number(bufferPercent) });
    }
    setStorage(STORAGE_KEYS.users, updated);
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
