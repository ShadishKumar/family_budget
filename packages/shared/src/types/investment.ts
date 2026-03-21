export interface InvestmentConfig {
  id: string;
  familyId: string;
  savingsPercentage: number;
  expectedReturnRate: number;
  projectionYears: number;
}

export interface YearlyProjection {
  year: number;
  invested: number;
  returns: number;
  totalValue: number;
  monthlyContribution: number;
}

export interface InvestmentInsight {
  monthlySavings: number;
  suggestedInvestment: number;
  projections: YearlyProjection[];
  tips: string[];
}

export interface SavingsRule {
  name: string;
  description: string;
  percentages: {
    needs: number;
    wants: number;
    savings: number;
  };
}
