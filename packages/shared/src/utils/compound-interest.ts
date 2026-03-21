import { YearlyProjection } from '../types/investment';

export interface ProjectionParams {
  principal: number;
  monthlyContribution: number;
  annualRate: number; // e.g., 12 for 12%
  years: number;
  compoundingFrequency?: number; // default 12 (monthly)
}

/**
 * Calculate compound interest projection with regular monthly contributions.
 * Formula: A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
 */
export function projectInvestment(params: ProjectionParams): YearlyProjection[] {
  const { principal, monthlyContribution, annualRate, years, compoundingFrequency = 12 } = params;
  const r = annualRate / 100;
  const n = compoundingFrequency;
  const projections: YearlyProjection[] = [];

  for (let year = 1; year <= years; year++) {
    const nt = n * year;
    const ratePerPeriod = r / n;

    // Future value of principal
    const principalFV = principal * Math.pow(1 + ratePerPeriod, nt);

    // Future value of monthly contributions (annuity)
    let annuityFV = 0;
    if (ratePerPeriod > 0) {
      annuityFV = monthlyContribution * ((Math.pow(1 + ratePerPeriod, nt) - 1) / ratePerPeriod);
    } else {
      annuityFV = monthlyContribution * nt;
    }

    const totalValue = principalFV + annuityFV;
    const totalInvested = principal + monthlyContribution * 12 * year;
    const totalReturns = totalValue - totalInvested;

    projections.push({
      year,
      invested: Math.round(totalInvested * 100) / 100,
      returns: Math.round(totalReturns * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      monthlyContribution,
    });
  }

  return projections;
}

/**
 * Suggest investment allocation based on the 50/30/20 rule.
 */
export function suggestAllocation(monthlyIncome: number, monthlyExpenses: number) {
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const tips: string[] = [];

  if (savingsRate < 10) {
    tips.push('Your savings rate is below 10%. Try to reduce discretionary spending.');
    tips.push('Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.');
  } else if (savingsRate < 20) {
    tips.push('Good start! Aim to increase your savings rate to at least 20%.');
    tips.push('Consider automating your savings with recurring transfers.');
  } else if (savingsRate < 30) {
    tips.push('Great savings rate! You are following the 50/30/20 rule well.');
    tips.push('Consider diversifying investments: mutual funds, PPF, and emergency fund.');
  } else {
    tips.push('Excellent savings rate! You are well ahead of most households.');
    tips.push('Consider maximizing tax-saving instruments like ELSS, PPF, NPS.');
  }

  if (monthlySavings > 0) {
    tips.push(`Consider investing at least ₹${Math.round(monthlySavings * 0.5).toLocaleString('en-IN')} monthly in SIP mutual funds.`);
    tips.push('Maintain an emergency fund of 6 months expenses before aggressive investing.');
  }

  return {
    monthlySavings,
    savingsRate: Math.round(savingsRate * 100) / 100,
    suggested: {
      emergencyFund: Math.round(monthlySavings * 0.2),
      mutualFunds: Math.round(monthlySavings * 0.4),
      fixedDeposits: Math.round(monthlySavings * 0.2),
      stocks: Math.round(monthlySavings * 0.15),
      gold: Math.round(monthlySavings * 0.05),
    },
    tips,
  };
}
