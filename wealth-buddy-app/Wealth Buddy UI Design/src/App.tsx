import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { QuickAdd } from './components/QuickAdd';
import { CalendarView } from './components/CalendarView';
import { RecurringExpenses } from './components/RecurringExpenses';
import { Goals } from './components/Goals';
import { Settings } from './components/Settings';
import { Home, Plus, Calendar, Repeat, Trophy, Settings as SettingsIcon } from 'lucide-react';

type Tab = 'dashboard' | 'add' | 'calendar' | 'recurring' | 'goals' | 'settings';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: string;
  notes: string;
  date: string;
}

interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  nextDueDate: string;
  status: 'active' | 'paid';
  icon: string;
}

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  emoji: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      amount: 5000,
      type: 'income',
      category: 'Salary',
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly salary',
      date: '2025-12-01'
    },
    {
      id: '2',
      amount: 45.50,
      type: 'expense',
      category: 'Food',
      paymentMethod: 'Card',
      notes: 'Grocery shopping',
      date: '2025-12-10'
    },
    {
      id: '3',
      amount: 120,
      type: 'expense',
      category: 'Transport',
      paymentMethod: 'Card',
      notes: 'Gas',
      date: '2025-12-08'
    },
    {
      id: '4',
      amount: 89.99,
      type: 'expense',
      category: 'Entertainment',
      paymentMethod: 'Card',
      notes: 'Concert tickets',
      date: '2025-12-12'
    },
  ]);

  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([
    { id: '1', name: 'Netflix', amount: 15.99, nextDueDate: '2025-12-15', status: 'active', icon: '🎬' },
    { id: '2', name: 'Spotify', amount: 9.99, nextDueDate: '2025-12-18', status: 'active', icon: '🎵' },
    { id: '3', name: 'Gym Membership', amount: 45.00, nextDueDate: '2025-12-20', status: 'active', icon: '💪' },
    { id: '4', name: 'Rent', amount: 1200, nextDueDate: '2025-12-28', status: 'paid', icon: '🏠' },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', name: 'New Car', current: 12500, target: 25000, emoji: '🚗' },
    { id: '2', name: 'Vacation', current: 2800, target: 5000, emoji: '✈️' },
    { id: '3', name: 'Emergency Fund', current: 8500, target: 10000, emoji: '🛡️' },
  ]);

  const [settings, setSettings] = useState({
    userName: 'Alex',
    monthlySalary: 5000,
    savingsTarget: 20,
    currency: 'USD',
    theme: 'dark',
    notifications: true,
  });

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const updateGoal = (id: string, amount: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, current: goal.current + amount } : goal
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} goals={goals} recurringItems={recurringItems} settings={settings} onOpenSettings={() => setActiveTab('settings')} />;
      case 'add':
        return <QuickAdd onAdd={addTransaction} onClose={() => setActiveTab('dashboard')} />;
      case 'calendar':
        return <CalendarView transactions={transactions} />;
      case 'recurring':
        return <RecurringExpenses items={recurringItems} />;
      case 'goals':
        return <Goals goals={goals} onUpdateGoal={updateGoal} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={setSettings} onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard transactions={transactions} goals={goals} recurringItems={recurringItems} settings={settings} onOpenSettings={() => setActiveTab('settings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1624] via-[#1A2332] to-[#0F1624] text-white">
      {/* Mobile Container */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24">
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        {activeTab !== 'settings' && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0F1624]/80 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-md mx-auto px-4 py-3">
              <div className="flex items-center justify-around">
                <TabButton
                  icon={<Home size={24} />}
                  label="Home"
                  active={activeTab === 'dashboard'}
                  onClick={() => setActiveTab('dashboard')}
                />
                <TabButton
                  icon={<Calendar size={24} />}
                  label="Calendar"
                  active={activeTab === 'calendar'}
                  onClick={() => setActiveTab('calendar')}
                />
                
                {/* Central Add Button */}
                <button
                  onClick={() => setActiveTab('add')}
                  className="relative -mt-8"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#00D9FF]/50 hover:shadow-[#00D9FF]/70 transition-all duration-300 hover:scale-110">
                    <Plus size={32} strokeWidth={3} />
                  </div>
                </button>

                <TabButton
                  icon={<Repeat size={24} />}
                  label="Recurring"
                  active={activeTab === 'recurring'}
                  onClick={() => setActiveTab('recurring')}
                />
                <TabButton
                  icon={<Trophy size={24} />}
                  label="Goals"
                  active={activeTab === 'goals'}
                  onClick={() => setActiveTab('goals')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-all duration-200"
    >
      <div className={`${active ? 'text-[#00D9FF]' : 'text-white/50'} transition-colors`}>
        {icon}
      </div>
      <span className={`text-xs ${active ? 'text-[#00D9FF]' : 'text-white/50'}`}>
        {label}
      </span>
    </button>
  );
}
