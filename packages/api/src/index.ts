export const analyzeOverspending = (income: number, expenses: number) => {
  if (expenses > income) {
    return "You are overspending";
  }
  return "Spending is within limits";
};

export const analyzeCategorySpending = (category: string, amount: number, threshold: number = 500) => {
  if (amount > threshold) {
    return `High ${category} spending`;
  }
  return `Normal ${category} spending`;
};
