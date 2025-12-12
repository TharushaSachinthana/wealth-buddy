import { useState } from 'react';
import { Target, TrendingUp, Plus, Sparkles } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  emoji: string;
}

interface GoalsProps {
  goals: Goal[];
  onUpdateGoal: (id: string, amount: number) => void;
}

export function Goals({ goals, onUpdateGoal }: GoalsProps) {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

  const handleContribution = (goalId: string) => {
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      onUpdateGoal(goalId, amount);
      setShowSuccess(true);
      setContributionAmount('');
      setSelectedGoal(null);
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 100) return '🎉 Goal achieved!';
    if (percentage >= 75) return '🔥 Almost there!';
    if (percentage >= 50) return '💪 Halfway done!';
    if (percentage >= 25) return '⭐ Great start!';
    return '🚀 You got this!';
  };

  const calculateTimeToGoal = (goal: Goal) => {
    const remaining = goal.target - goal.current;
    const avgMonthlySavings = 500; // Example average
    const monthsRemaining = Math.ceil(remaining / avgMonthlySavings);
    
    if (monthsRemaining <= 0) return 'Goal reached!';
    if (monthsRemaining === 1) return '1 month';
    if (monthsRemaining < 12) return `${monthsRemaining} months`;
    
    const years = Math.floor(monthsRemaining / 12);
    const months = monthsRemaining % 12;
    return `${years}y ${months}m`;
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00E676] to-[#00D9FF] flex items-center justify-center shadow-2xl shadow-[#00E676]/50">
              <Sparkles size={48} />
            </div>
            <p className="text-xl">Contribution Added! 🎊</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl">Savings Goals</h1>
        <p className="text-white/60 text-sm mt-1">Track your financial dreams</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-[#00E676]/20 to-[#00D9FF]/20 backdrop-blur-xl rounded-3xl p-6 border border-[#00E676]/30 shadow-2xl shadow-[#00E676]/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Total Saved</p>
            <h2 className="text-4xl">${totalSaved.toLocaleString()}</h2>
            <p className="text-sm text-white/60 mt-2">of ${totalTarget.toLocaleString()} goal</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-[#00E676]/30 flex items-center justify-center">
            <Target size={32} />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00E676] to-[#00D9FF] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>
        <p className="text-sm text-white/60 mt-2 text-right">{overallProgress.toFixed(1)}% complete</p>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100;
          const isComplete = progress >= 100;
          const isSelected = selectedGoal === goal.id;

          return (
            <div
              key={goal.id}
              className={`bg-white/5 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 ${
                isComplete 
                  ? 'border-[#00E676]/50 shadow-lg shadow-[#00E676]/20' 
                  : isSelected
                  ? 'border-[#00D9FF] shadow-lg shadow-[#00D9FF]/30'
                  : 'border-white/10'
              }`}
            >
              {/* Goal Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D9FF]/20 to-[#A855F7]/20 flex items-center justify-center text-3xl border border-white/10">
                    {goal.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">{goal.name}</h3>
                    <p className="text-sm text-white/60">
                      {getMotivationalMessage(progress)}
                    </p>
                  </div>
                </div>
                {!isComplete && (
                  <button
                    onClick={() => setSelectedGoal(isSelected ? null : goal.id)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[#00D9FF]/30"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl">${goal.current.toLocaleString()}</span>
                  <span className="text-white/60">of ${goal.target.toLocaleString()}</span>
                </div>
                
                <div className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                      isComplete 
                        ? 'bg-gradient-to-r from-[#00E676] to-[#00D9FF]'
                        : 'bg-gradient-to-r from-[#A855F7] to-[#EC4899]'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full ${
                    isComplete ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-[#A855F7]/20 text-[#A855F7]'
                  }`}>
                    {progress.toFixed(0)}% saved
                  </div>
                </div>
                {!isComplete && (
                  <div className="flex items-center gap-1 text-white/60">
                    <TrendingUp size={14} />
                    <span>~{calculateTimeToGoal(goal)}</span>
                  </div>
                )}
              </div>

              {/* Contribution Input */}
              {isSelected && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                  <p className="text-sm text-white/60">Add contribution</p>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:border-[#00D9FF] transition-colors"
                    />
                    <button
                      onClick={() => handleContribution(goal.id)}
                      disabled={!contributionAmount || parseFloat(contributionAmount) <= 0}
                      className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                        contributionAmount && parseFloat(contributionAmount) > 0
                          ? 'bg-gradient-to-r from-[#00D9FF] to-[#A855F7] hover:shadow-lg hover:shadow-[#00D9FF]/50'
                          : 'bg-white/10 text-white/40 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <Target size={32} className="text-white/40" />
          </div>
          <h3 className="text-lg mb-2">No goals yet</h3>
          <p className="text-white/60 text-sm">Set your first savings goal and start your journey!</p>
        </div>
      )}
    </div>
  );
}
