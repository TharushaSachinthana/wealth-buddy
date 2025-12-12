import { ArrowLeft, User, DollarSign, Bell, Moon, Info, CreditCard } from 'lucide-react';

interface SettingsData {
  userName: string;
  monthlySalary: number;
  savingsTarget: number;
  currency: string;
  theme: string;
  notifications: boolean;
}

interface SettingsProps {
  settings: SettingsData;
  onUpdate: (settings: SettingsData) => void;
  onBack: () => void;
}

export function Settings({ settings, onUpdate, onBack }: SettingsProps) {
  const handleUpdate = (key: keyof SettingsData, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl">Settings</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-gradient-to-br from-[#00D9FF]/20 to-[#A855F7]/20 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl shadow-[#00D9FF]/20">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center text-3xl shadow-lg shadow-[#00D9FF]/50">
            {settings.userName[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl mb-1">{settings.userName}</h2>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FFB800]/30 to-[#FF5252]/30 border border-[#FFB800]/50 text-xs">
                ✨ Premium Member
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="space-y-3">
        <h3 className="text-sm text-white/60 px-2">Financial Settings</h3>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#00D9FF]/20 flex items-center justify-center">
                <DollarSign size={18} className="text-[#00D9FF]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/60">Monthly Salary</p>
                <p className="text-lg">${settings.monthlySalary.toLocaleString()}</p>
              </div>
            </div>
            <input
              type="number"
              value={settings.monthlySalary}
              onChange={(e) => handleUpdate('monthlySalary', parseFloat(e.target.value) || 0)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-[#00D9FF] transition-colors"
              placeholder="Enter monthly salary"
            />
          </div>

          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#00E676]/20 flex items-center justify-center">
                <CreditCard size={18} className="text-[#00E676]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/60">Savings Target</p>
                <p className="text-lg">{settings.savingsTarget}% of income</p>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={settings.savingsTarget}
              onChange={(e) => handleUpdate('savingsTarget', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00D9FF]"
            />
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#A855F7]/20 flex items-center justify-center">
                <DollarSign size={18} className="text-[#A855F7]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/60">Currency</p>
                <p className="text-lg">{settings.currency}</p>
              </div>
            </div>
            <select
              value={settings.currency}
              onChange={(e) => handleUpdate('currency', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-[#00D9FF] transition-colors"
            >
              <option value="USD" className="bg-[#1A2332]">USD - US Dollar</option>
              <option value="EUR" className="bg-[#1A2332]">EUR - Euro</option>
              <option value="GBP" className="bg-[#1A2332]">GBP - British Pound</option>
              <option value="JPY" className="bg-[#1A2332]">JPY - Japanese Yen</option>
              <option value="AUD" className="bg-[#1A2332]">AUD - Australian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="space-y-3">
        <h3 className="text-sm text-white/60 px-2">App Preferences</h3>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EC4899]/20 flex items-center justify-center">
                  <Bell size={18} className="text-[#EC4899]" />
                </div>
                <div>
                  <p className="text-sm">Notifications</p>
                  <p className="text-xs text-white/60">Get reminders about bills</p>
                </div>
              </div>
              <button
                onClick={() => handleUpdate('notifications', !settings.notifications)}
                className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                  settings.notifications ? 'bg-[#00D9FF]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-lg ${
                    settings.notifications ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                  <Moon size={18} className="text-[#FFB800]" />
                </div>
                <div>
                  <p className="text-sm">Dark Mode</p>
                  <p className="text-xs text-white/60">Always enabled</p>
                </div>
              </div>
              <div className="w-14 h-8 rounded-full bg-[#00D9FF] relative">
                <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="space-y-3">
        <h3 className="text-sm text-white/60 px-2">About</h3>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <button className="w-full p-5 border-b border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Info size={18} />
              </div>
              <span className="text-sm">Version</span>
            </div>
            <span className="text-sm text-white/60">1.0.0</span>
          </button>

          <button className="w-full p-5 border-b border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="text-sm">Terms & Privacy</span>
            </div>
          </button>

          <button className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Info size={18} />
              </div>
              <span className="text-sm">Help & Support</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-white/40 py-8">
        <p>Made with ❤️ by Wealth Buddy</p>
        <p className="mt-1">Your Personal Finance Companion</p>
      </div>
    </div>
  );
}
