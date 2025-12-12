import { useState } from 'react';
import { X, Wallet, CreditCard, Banknote, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface QuickAddProps {
  onAdd: (transaction: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    paymentMethod: string;
    notes: string;
    date: string;
  }) => void;
  onClose: () => void;
}

const categories = {
  expense: [
    { name: 'Food', emoji: '🍔', color: '#00D9FF' },
    { name: 'Transport', emoji: '🚗', color: '#A855F7' },
    { name: 'Shopping', emoji: '🛍️', color: '#EC4899' },
    { name: 'Bills', emoji: '📄', color: '#FFB800' },
    { name: 'Entertainment', emoji: '🎮', color: '#00E676' },
    { name: 'Health', emoji: '💊', color: '#FF5252' },
    { name: 'Education', emoji: '📚', color: '#00D9FF' },
    { name: 'Other', emoji: '💰', color: '#A855F7' },
  ],
  income: [
    { name: 'Salary', emoji: '💼', color: '#00E676' },
    { name: 'Freelance', emoji: '💻', color: '#00D9FF' },
    { name: 'Investment', emoji: '📈', color: '#A855F7' },
    { name: 'Gift', emoji: '🎁', color: '#EC4899' },
    { name: 'Other', emoji: '💰', color: '#FFB800' },
  ],
};

const paymentMethods = [
  { name: 'Card', icon: <CreditCard size={16} /> },
  { name: 'Cash', icon: <Banknote size={16} /> },
  { name: 'Bank Transfer', icon: <Wallet size={16} /> },
];

export function QuickAdd({ onAdd, onClose }: QuickAddProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (!amount || !category) return;

    onAdd({
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod,
      notes,
      date,
    });

    // Show success animation
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1000);
  };

  const handleNumberInput = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    setAmount(amount + num);
  };

  const handleBackspace = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleClear = () => {
    setAmount('');
  };

  return (
    <div className="min-h-screen p-6 relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center animate-bounce">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center shadow-2xl shadow-[#00D9FF]/50">
              <span className="text-5xl">✓</span>
            </div>
            <p className="text-xl">Transaction Added!</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl">Quick Add</h1>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Amount Display */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-6">
        <p className="text-white/60 text-sm mb-2">Amount</p>
        <div className="flex items-baseline gap-2">
          <span className="text-white/40 text-3xl">$</span>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="0.00"
            className="bg-transparent text-5xl outline-none w-full"
          />
        </div>
      </div>

      {/* Type Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => {
            setType('expense');
            setCategory('');
          }}
          className={`flex-1 py-4 rounded-2xl border transition-all duration-300 ${
            type === 'expense'
              ? 'bg-gradient-to-br from-[#FF5252]/20 to-[#EC4899]/20 border-[#FF5252] shadow-lg shadow-[#FF5252]/20'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowDownCircle size={20} className={type === 'expense' ? 'text-[#FF5252]' : 'text-white/40'} />
            <span>Expense</span>
          </div>
        </button>
        <button
          onClick={() => {
            setType('income');
            setCategory('');
          }}
          className={`flex-1 py-4 rounded-2xl border transition-all duration-300 ${
            type === 'income'
              ? 'bg-gradient-to-br from-[#00E676]/20 to-[#00D9FF]/20 border-[#00E676] shadow-lg shadow-[#00E676]/20'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowUpCircle size={20} className={type === 'income' ? 'text-[#00E676]' : 'text-white/40'} />
            <span>Income</span>
          </div>
        </button>
      </div>

      {/* Category Grid */}
      <div className="mb-6">
        <p className="text-sm text-white/60 mb-3">Category</p>
        <div className="grid grid-cols-4 gap-3">
          {categories[type].map((cat) => (
            <button
              key={cat.name}
              onClick={() => setCategory(cat.name)}
              className={`aspect-square rounded-2xl border transition-all duration-300 ${
                category === cat.name
                  ? 'border-[#00D9FF] shadow-lg shadow-[#00D9FF]/30 scale-105'
                  : 'bg-white/5 border-white/10'
              }`}
              style={{
                background: category === cat.name ? `${cat.color}20` : undefined,
              }}
            >
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs">{cat.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <p className="text-sm text-white/60 mb-3">Payment Method</p>
        <div className="flex gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.name}
              onClick={() => setPaymentMethod(method.name)}
              className={`flex-1 py-3 rounded-xl border transition-all duration-300 ${
                paymentMethod === method.name
                  ? 'bg-gradient-to-br from-[#00D9FF]/20 to-[#A855F7]/20 border-[#00D9FF] shadow-lg shadow-[#00D9FF]/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {method.icon}
                <span className="text-sm">{method.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <p className="text-sm text-white/60 mb-3">Notes (Optional)</p>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note..."
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D9FF] transition-colors"
        />
      </div>

      {/* Date */}
      <div className="mb-6">
        <p className="text-sm text-white/60 mb-3">Date</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00D9FF] transition-colors"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!amount || !category}
        className={`w-full py-4 rounded-2xl text-lg transition-all duration-300 ${
          amount && category
            ? 'bg-gradient-to-r from-[#00D9FF] to-[#A855F7] shadow-2xl shadow-[#00D9FF]/40 hover:shadow-[#00D9FF]/60 hover:scale-105'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        Add Transaction
      </button>
    </div>
  );
}
