import React, { createContext, useContext, useState, useEffect } from 'react';
import * as db from '../core/db';
import { initializeDatabase, seedSampleData } from '../core/dbInit';

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

  // Initialize database on first load
  useEffect(() => {
    initDb();
  }, []);

  const initDb = async () => {
    try {
      await initializeDatabase();
      await seedSampleData();
      await loadAll();
    } catch (error) {
      console.error('Database initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      const userData = await db.getUser();
      setUser(userData);

      const cats = await db.getCategories();
      setCategories(cats);

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const trans = await db.getTransactions(year, month);
      setTransactions(trans);

      const rec = await db.getRecurring();
      setRecurring(rec);

      const allGoals = await db.getGoals();
      setGoals(allGoals);

      const alloc = await db.calculateAllocation();
      setAllocation(alloc);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addTransaction = async (categoryId, amount, date, method = 'card', notes = '') => {
    try {
      await db.addTransaction(categoryId, amount, date, method, notes);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await db.deleteTransaction(id);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  };

  const addRecurring = async (categoryId, amount, frequency, name) => {
    try {
      await db.addRecurring(categoryId, amount, frequency, name);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error adding recurring:', error);
      return false;
    }
  };

  const deleteRecurring = async (id) => {
    try {
      await db.deleteRecurring(id);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error deleting recurring:', error);
      return false;
    }
  };

  const saveGoal = async (id, name, target, current, deadline) => {
    try {
      await db.saveGoal(id, name, target, current, deadline);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error saving goal:', error);
      return false;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await db.deleteGoal(id);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  };

  const updateSettings = async (name, salary, savingsPercent, bufferPercent) => {
    try {
      await db.updateUser(name, salary, savingsPercent, bufferPercent);
      await loadAll();
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  const navigateMonth = (offset) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const value = {
    user,
    transactions,
    recurring,
    goals,
    allocation,
    categories,
    currentMonth,
    loading,
    addTransaction,
    deleteTransaction,
    addRecurring,
    deleteRecurring,
    saveGoal,
    deleteGoal,
    updateSettings,
    navigateMonth,
    loadAll,
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
