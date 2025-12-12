import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
}

interface RecurringItem {
  id: string;
  amount: number;
  status: string;
}

interface DashboardProps {
  transactions: Transaction[];
  goals: Goal[];
  recurringItems: RecurringItem[];
  settings: {
    userName: string;
    monthlySalary: number;
    savingsTarget: number;
  };
  onOpenSettings: () => void;
}

export function Dashboard({ transactions, goals, recurringItems, settings, onOpenSettings }: DashboardProps) {
  const [animatedBalance, setAnimatedBalance] = useState(0);
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const savingsScore = Math.min(100, Math.round((netBalance / totalIncome) * 100));

  // Animated counter effect
  useEffect(() => {
    let start = 0;
    const end = netBalance;
    const duration = 1500;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setAnimatedBalance(end);
        clearInterval(timer);
      } else {
        setAnimatedBalance(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [netBalance]);

  // Category breakdown
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  
  const COLORS = ['#00D9FF', '#A855F7', '#EC4899', '#00E676', '#FFB800', '#FF5252'];

  // Last 7 days spending
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const spendingTrend = last7Days.map(date => {
    const dayExpenses = transactions
      .filter(t => t.type === 'expense' && t.date === date)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      day: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
      amount: dayExpenses,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">Welcome back,</p>
          <h1 className="text-2xl">{settings.userName}</h1>
        </div>
        <button
          onClick={onOpenSettings}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#00E676]/20 flex items-center justify-center">
              <TrendingUp size={16} className="text-[#00E676]" />
            </div>
            <span className="text-white/60 text-sm">Income</span>
          </div>
          <p className="text-2xl text-[#00E676]">${totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#FF5252]/20 flex items-center justify-center">
              <TrendingDown size={16} className="text-[#FF5252]" />
            </div>
            <span className="text-white/60 text-sm">Expenses</span>
          </div>
          <p className="text-2xl text-[#FF5252]">${totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Net Balance Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00D9FF]/20 to-[#A855F7]/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-[#00D9FF]/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D9FF]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A855F7]/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <p className="text-white/70 text-sm mb-2">Net Balance</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl tracking-tight">
              ${Math.abs(animatedBalance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            {netBalance >= 0 ? (
              <ArrowUpRight className="text-[#00E676]" size={32} />
            ) : (
              <ArrowDownRight className="text-[#FF5252]" size={32} />
            )}
          </div>
          <p className={`text-sm mt-2 ${netBalance >= 0 ? 'text-[#00E676]' : 'text-[#FF5252]'}`}>
            {netBalance >= 0 ? '↑' : '↓'} {Math.abs(((netBalance / totalIncome) * 100) || 0).toFixed(1)}% this month
          </p>
        </div>
      </div>

      {/* Savings Score */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg mb-1">Financial Health</h3>
            <p className="text-white/60 text-sm">
              {savingsScore >= 80 ? '🎉 Excellent!' : savingsScore >= 60 ? '👍 Good' : savingsScore >= 40 ? '⚠️ Fair' : '🚨 Needs Attention'}
            </p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(savingsScore / 100) * 251.2} 251.2`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D9FF" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl">{savingsScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        {/* Expense Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg mb-4">Expense Breakdown</h3>
          {pieData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(26, 35, 50, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/40 text-center py-12">No expenses yet</p>
          )}
          
          <div className="mt-4 space-y-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm text-white/60">${item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spending Trend */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg mb-4">7-Day Spending Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingTrend}>
                <XAxis 
                  dataKey="day" 
                  stroke="#ffffff40"
                  tick={{ fill: '#ffffff80', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#ffffff40"
                  tick={{ fill: '#ffffff80', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(26, 35, 50, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D9FF" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl text-[#00D9FF]">{transactions.length}</p>
            <p className="text-xs text-white/60 mt-1">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#A855F7]">{recurringItems.filter(i => i.status === 'active').length}</p>
            <p className="text-xs text-white/60 mt-1">Active Bills</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-[#EC4899]">{goals.length}</p>
            <p className="text-xs text-white/60 mt-1">Goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
