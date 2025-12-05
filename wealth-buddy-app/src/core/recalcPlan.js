/**
 * Recalculate monthly allocation based on income and goals
 * Returns updated allocation with warnings if goals are underfunded
 */

function recalcPlan(allocation, income, goals) {
  const newAllocation = { ...allocation };

  // Goals that need to be prioritized for underfunding
  const underfundedGoals = [];

  // Check if any goals are underfunded
  if (goals && goals.length > 0) {
    const allocatedToGoals = newAllocation.savings || 0;
    const requiredForGoals = goals.reduce((sum, goal) => sum + (goal.monthlyAmount || 0), 0);

    if (requiredForGoals > allocatedToGoals) {
      goals.forEach((goal) => {
        if (goal.monthlyAmount > 0) {
          underfundedGoals.push({
            name: goal.name,
            required: goal.monthlyAmount,
            actual: Math.max(0, (allocatedToGoals / requiredForGoals) * goal.monthlyAmount),
          });
        }
      });
    }
  }

  return {
    allocation: newAllocation,
    warnings: underfundedGoals,
  };
}

module.exports = { recalcPlan };
