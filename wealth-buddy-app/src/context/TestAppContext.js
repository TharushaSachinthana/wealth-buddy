import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user] = useState(null);
  const [loading] = useState(false);
  const [transactions] = useState([]);
  const [recurring] = useState([]);
  const [goals] = useState([]);
  const [allocation] = useState(null);
  const [categories] = useState([]);
  const [currentMonth] = useState(new Date());

  const value = {
    user,
    transactions,
    recurring,
    goals,
    allocation,
    categories,
    currentMonth,
    loading,
    addTransaction: async () => true,
    deleteTransaction: async () => true,
    addRecurring: async () => true,
    deleteRecurring: async () => true,
    saveGoal: async () => true,
    deleteGoal: async () => true,
    updateSettings: async () => true,
    navigateMonth: () => {},
    loadAll: async () => {},
    formatMoney: (amount) => `$${(amount || 0).toFixed(2)}`,
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
