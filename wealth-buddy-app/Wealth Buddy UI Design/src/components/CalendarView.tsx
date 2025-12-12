import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  notes: string;
  date: string;
}

interface CalendarViewProps {
  transactions: Transaction[];
}

export function CalendarView({ transactions }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthName = currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
    setSelectedDate(null);
  };

  const getTransactionsForDate = (dateStr: string) => {
    return transactions.filter(t => t.date === dateStr);
  };

  const getDayTotal = (dateStr: string) => {
    const dayTransactions = getTransactionsForDate(dateStr);
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, net: income - expenses };
  };

  const selectedDateTransactions = selectedDate ? getTransactionsForDate(selectedDate) : [];
  const selectedDayTotal = selectedDate ? getDayTotal(selectedDate) : null;

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Calendar</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={goToPreviousMonth}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="min-w-[160px] text-center">{monthName}</span>
          <button
            onClick={goToNextMonth}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm text-white/60 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTotal = getDayTotal(dateStr);
            const hasTransactions = dayTotal.income > 0 || dayTotal.expenses > 0;
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl border transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#00D9FF]/30 to-[#A855F7]/30 border-[#00D9FF] shadow-lg shadow-[#00D9FF]/30 scale-105'
                    : isToday
                    ? 'border-[#00D9FF]/50 bg-white/5'
                    : 'border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm ${isToday ? 'text-[#00D9FF]' : ''}`}>{day}</span>
                  {hasTransactions && (
                    <div className="flex gap-0.5 mt-1">
                      {dayTotal.income > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                      )}
                      {dayTotal.expenses > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF5252]" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">
              {new Date(selectedDate).toLocaleDateString('en', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            {selectedDayTotal && (
              <div className={`px-4 py-2 rounded-full ${
                selectedDayTotal.net >= 0 ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-[#FF5252]/20 text-[#FF5252]'
              }`}>
                ${Math.abs(selectedDayTotal.net).toFixed(2)}
              </div>
            )}
          </div>

          {selectedDateTransactions.length === 0 ? (
            <p className="text-white/40 text-center py-8">No transactions on this day</p>
          ) : (
            <div className="space-y-3">
              {selectedDateTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-[#00E676]/20' 
                        : 'bg-[#FF5252]/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp size={20} className="text-[#00E676]" />
                      ) : (
                        <TrendingDown size={20} className="text-[#FF5252]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{transaction.category}</p>
                      {transaction.notes && (
                        <p className="text-xs text-white/60">{transaction.notes}</p>
                      )}
                    </div>
                  </div>
                  <p className={`text-lg ${
                    transaction.type === 'income' ? 'text-[#00E676]' : 'text-[#FF5252]'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
