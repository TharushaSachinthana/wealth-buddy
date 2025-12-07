// CSV Export utility for monthly reports

export function generateMonthlyReportCSV(transactions, categories, user, year, month) {
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const netAmount = totalIncome - totalExpenses;

  // Calculate savings score
  const expectedSavings = user ? (totalIncome * (user.savingsPercent || 15)) / 100 : 0;
  const actualSavings = netAmount > 0 ? netAmount : 0;
  const savingsRatio = expectedSavings > 0 ? (actualSavings / expectedSavings) * 100 : 0;
  
  let savingsScore = 'N/A';
  if (savingsRatio >= 100) savingsScore = 'Excellent';
  else if (savingsRatio >= 75) savingsScore = 'Good';
  else if (savingsRatio >= 50) savingsScore = 'Fair';
  else if (savingsRatio >= 25) savingsScore = 'Poor';
  else if (savingsRatio >= 0) savingsScore = 'Bad';

  // Find maximum expense
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  const maxExpense = expenseTransactions.length > 0 
    ? expenseTransactions.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, expenseTransactions[0])
    : null;

  // Find maximum expensive day
  const expensesByDay = {};
  expenseTransactions.forEach(t => {
    const day = t.date;
    if (!expensesByDay[day]) expensesByDay[day] = 0;
    expensesByDay[day] += Math.abs(t.amount);
  });
  
  const maxExpensiveDay = Object.keys(expensesByDay).length > 0
    ? Object.entries(expensesByDay).reduce((max, [day, amount]) => 
        amount > max.amount ? { day, amount } : max, 
        { day: Object.keys(expensesByDay)[0], amount: expensesByDay[Object.keys(expensesByDay)[0]] }
      )
    : null;

  // Build CSV content
  let csv = `Monthly Financial Report - ${monthName}\n`;
  csv += `Generated on: ${new Date().toLocaleDateString('en-US')}\n\n`;
  
  // User Information
  csv += `USER INFORMATION\n`;
  csv += `Name,${user?.name || 'N/A'}\n`;
  csv += `Monthly Salary,Rs. ${(user?.salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  csv += `Savings Target,${user?.savingsPercent || 0}%\n`;
  csv += `Buffer Target,${user?.bufferPercent || 0}%\n\n`;
  
  // Summary
  csv += `MONTHLY SUMMARY\n`;
  csv += `Total Income,Rs. ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  csv += `Total Expenses,Rs. ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  csv += `Net Amount,Rs. ${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  csv += `Savings Score,${savingsScore}\n`;
  csv += `Total Transactions,${transactions.length}\n\n`;
  
  // Analysis
  csv += `ANALYSIS\n`;
  if (maxExpense) {
    const category = categories.find(c => c.id === maxExpense.categoryId);
    csv += `Maximum Expense,Rs. ${Math.abs(maxExpense.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    csv += `Maximum Expense Category,${category?.name || 'Unknown'}\n`;
    csv += `Maximum Expense Date,${maxExpense.date}\n`;
  }
  if (maxExpensiveDay) {
    csv += `Most Expensive Day,${new Date(maxExpensiveDay.day).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    csv += `Most Expensive Day Amount,Rs. ${maxExpensiveDay.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  }
  csv += `\n`;
  
  // Transactions
  csv += `TRANSACTIONS\n`;
  csv += `Date,Category,Type,Amount,Payment Method,Notes\n`;
  
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(t => {
    const category = categories.find(c => c.id === t.categoryId);
    const type = t.amount > 0 ? 'Income' : 'Expense';
    const amount = Math.abs(t.amount);
    csv += `${t.date},${category?.name || 'Unknown'},${type},Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })},${t.method || 'N/A'},${t.notes || ''}\n`;
  });
  
  return csv;
}

export function downloadCSV(csvContent, filename) {
  // For web platform
  if (typeof window !== 'undefined') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  }
  return false;
}

