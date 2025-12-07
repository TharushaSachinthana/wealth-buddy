import React, { createContext, useContext, useState, useEffect } from 'react';
import * as db from '../core/db-v2';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [goals, setGoals] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDb();
  }, []);

  useEffect(() => {
    // Reload data when month changes
    if (!loading) {
      loadAll();
    }
  }, [currentMonth]);

  const initDb = async () => {
    try {
      console.log('🔄 Initializing database...');
      await db.initializeSchema();
      await db.seedSampleData();
      console.log('✓ Database initialized');
      await loadAll();
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      console.log('🔄 Loading data...');
      
      const userData = await db.getUser();
      console.log('✓ User loaded:', userData);
      setUser(userData);

      const cats = await db.getCategories();
      console.log('✓ Categories loaded:', cats.length);
      setCategories(cats);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const trans = await db.getTransactions(year, month);
      console.log('✓ Transactions loaded:', trans.length);
      setTransactions(trans);

      const rec = await db.getRecurring();
      console.log('✓ Recurring loaded:', rec.length);
      setRecurring(rec);

      const goalsData = await db.getGoals();
      console.log('✓ Goals loaded:', goalsData.length);
      setGoals(goalsData);

      if (userData) {
        // Calculate actual income from transactions (if any) or use salary
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;
        const monthTransactions = await db.getTransactions(year, month);
        const actualIncome = monthTransactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + (t.amount || 0), 0) || userData.salary || 0;
        
        // Calculate allocation based on actual income
        const alloc = db.calculateAllocation({ ...userData, salary: actualIncome });
        console.log('✓ Allocation calculated:', alloc);
        // Ensure all allocation values are numbers
        setAllocation({
          essentials: Number(alloc.essentials) || 0,
          savings: Number(alloc.savings) || 0,
          discretionary: Number(alloc.discretionary) || 0,
          buffer: Number(alloc.buffer) || 0,
        });
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    }
  };

  const addTransaction = async (categoryId, amount, date, method = 'card', notes = '') => {
    try {
      const success = await db.addTransaction(categoryId, amount, date, method, notes);
      if (success) {
        await loadAll();
        // Auto-update goals based on savings from income transactions
        await updateGoalsFromSavings();
      }
      return success;
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      return false;
    }
  };

  const updateGoalsFromSavings = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const monthTransactions = await db.getTransactions(year, month);
      const allGoals = await db.getGoals();
      
      if (allGoals.length === 0) return;

      // Calculate net savings (income - expenses) for this month
      const totalIncome = monthTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const totalExpenses = monthTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

      const netSavings = totalIncome - totalExpenses;
      
      // If we have positive savings, distribute to goals proportionally
      if (netSavings > 0 && user) {
        const savingsPercent = (user.savingsPercent || 15) / 100;
        const savingsAmount = netSavings * savingsPercent;
        const totalGoalTargets = allGoals.reduce((sum, g) => sum + (g.target || 0), 0);
        
        if (totalGoalTargets > 0 && savingsAmount > 0) {
          // Distribute savings proportionally to goals
          for (const goal of allGoals) {
            const goalShare = (goal.target / totalGoalTargets) * savingsAmount;
            const newCurrent = Math.min((goal.current || 0) + goalShare, goal.target);
            
            // Only update if there's a meaningful change
            if (Math.abs(newCurrent - (goal.current || 0)) > 0.01) {
              await db.saveGoal(goal.name, goal.target, newCurrent, goal.deadline);
            }
          }
          // Reload to show updated goals
          await loadAll();
        }
      }
    } catch (error) {
      console.error('❌ Error updating goals from savings:', error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const success = await db.deleteTransaction(id);
      if (success) await loadAll();
      return success;
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      return false;
    }
  };

  const addRecurring = async (categoryId, amount, frequency, name) => {
    try {
      const success = await db.addRecurring(categoryId, amount, frequency, name);
      if (success) await loadAll();
      return success;
    } catch (error) {
      console.error('❌ Error adding recurring:', error);
      return false;
    }
  };

  const deleteRecurring = async (id) => {
    try {
      const success = await db.deleteRecurring(id);
      if (success) await loadAll();
      return success;
    } catch (error) {
      console.error('❌ Error deleting recurring:', error);
      return false;
    }
  };

  const saveGoal = async (id, name, target, current = 0, deadline = '') => {
    try {
      // db.saveGoal uses name-based lookup, so we ignore id parameter
      const success = await db.saveGoal(name, target, current, deadline);
      if (success) await loadAll();
      return success;
    } catch (error) {
      console.error('❌ Error saving goal:', error);
      return false;
    }
  };

  const deleteGoal = async (id) => {
    try {
      const success = await db.deleteGoal(id);
      if (success) await loadAll();
      return success;
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      return false;
    }
  };

  const updateSettings = async (name, salary, savingsPercent, bufferPercent) => {
    try {
      const success = await db.updateUser(name, salary, savingsPercent, bufferPercent);
      if (success) await loadAll();
      return success;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      return false;
    }
  };

  const navigateMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const value = {
    user: user || null,
    transactions: transactions || [],
    recurring: recurring || [],
    goals: goals || [],
    allocation: allocation || { essentials: 0, savings: 0, discretionary: 0, buffer: 0 },
    categories: categories || [],
    currentMonth: currentMonth || new Date(),
    loading: Boolean(loading),
    addTransaction,
    deleteTransaction,
    addRecurring,
    deleteRecurring,
    saveGoal,
    deleteGoal,
    updateSettings,
    navigateMonth,
    loadAll,
    formatMoney: db.formatMoney,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
