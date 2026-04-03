interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface CategoryData {
  category: string;
  income: number;
  expense: number;
  net: number;
}

export interface Insight {
  type: "warning" | "info" | "success";
  title: string;
  message: string;
}

//  Overspending detection
const ruleOverspending = (income: number, expense: number): Insight | null => {
  if (expense > income) {
    const pct = income > 0 ? Math.round(((expense - income) / income) * 100) : 100;
    return {
      type: "warning",
      title: "Overspending Detected",
      message: `Your expenses exceed income by ${pct}%. Consider reducing discretionary spending.`,
    };
  }
  const savings = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
  if (savings >= 20) {
    return {
      type: "success",
      title: "Healthy Savings Rate",
      message: `You're saving ${savings}% of your income. Great financial discipline!`,
    };
  }
  return null;
};

// High category spending
const ruleCategorySpending = (
  categories: CategoryData[],
  totalIncome: number
): Insight[] => {
  const threshold = totalIncome * 0.3;
  return categories
    .filter((c) => c.expense > threshold && totalIncome > 0)
    .map((c) => ({
      type: "warning" as const,
      title: `High ${c.category} Spending`,
      message: `You spent $${c.expense.toFixed(2)} on "${c.category}", which is ${Math.round((c.expense / totalIncome) * 100)}% of your income.`,
    }));
};

//Trend analysis
const ruleTrends = (trends: MonthlyTrend[]): Insight | null => {
  if (trends.length < 2) return null;
  const last = trends[trends.length - 1];
  const prev = trends[trends.length - 2];
  if (!last || !prev) return null;
  const expenseChange = last.expense - prev.expense;
  if (expenseChange > 0) {
    const pct = prev.expense > 0 ? Math.round((expenseChange / prev.expense) * 100) : 100;
    if (pct >= 20) {
      return {
        type: "warning",
        title: "Rising Expenses",
        message: `Your expenses increased by ${pct}% in ${last.month} compared to ${prev.month}. Review your recent spending.`,
      };
    }
  } else if (expenseChange < 0) {
    const pct = prev.expense > 0 ? Math.round((Math.abs(expenseChange) / prev.expense) * 100) : 0;
    if (pct >= 10) {
      return {
        type: "success",
        title: "Spending Reduced",
        message: `Well done! Your expenses dropped by ${pct}% compared to last month.`,
      };
    }
  }
  return null;
};

// No income recorded
const ruleNoIncome = (income: number, totalRecords: number): Insight | null => {
  if (totalRecords > 0 && income === 0) {
    return {
      type: "info",
      title: "No Income Recorded",
      message: "Add income records to get a complete picture of your finances.",
    };
  }
  return null;
};

export const getInsights = (params: {
  income: number;
  expenses: number;
  totalRecords: number;
  categories: CategoryData[];
  trends: MonthlyTrend[];
}): Insight[] => {
  const { income, expenses, totalRecords, categories, trends } = params;
  const insights: Insight[] = [];

  const overspend = ruleOverspending(income, expenses);
  if (overspend) insights.push(overspend);

  insights.push(...ruleCategorySpending(categories, income));

  const trend = ruleTrends(trends);
  if (trend) insights.push(trend);

  const noIncome = ruleNoIncome(income, totalRecords);
  if (noIncome) insights.push(noIncome);

  if (insights.length === 0) {
    insights.push({
      type: "info",
      title: "All Good",
      message: "No significant financial issues detected. Keep tracking your records!",
    });
  }

  return insights;
};
