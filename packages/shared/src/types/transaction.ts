import { Category } from './category';
import { User } from './user';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type InputMethod = 'MANUAL' | 'VOICE' | 'OCR';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  exchangeRate?: number;
  description: string;
  date: string;
  type: TransactionType;
  inputMethod: InputMethod;
  receiptUrl?: string;
  ocrRawText?: string;
  notes?: string;
  categoryId: string;
  category: Category;
  userId: string;
  user?: User;
  familyId: string;
  tags: TransactionTag[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionTag {
  id: string;
  tag: string;
  transactionId: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  inputMethod?: InputMethod;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  byCategory: { categoryId: string; categoryName: string; total: number; color?: string }[];
  byMonth: { month: string; income: number; expenses: number }[];
}

export interface OcrScanResult {
  merchantName?: string;
  totalAmount?: number;
  date?: string;
  items?: { name: string; amount: number }[];
  suggestedCategory?: string;
  rawText: string;
  confidence: number;
}
