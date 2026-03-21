import { CategoryType } from '../types/category';

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expense categories
  { name: 'Groceries', icon: '🛒', color: '#4CAF50', type: 'EXPENSE' },
  { name: 'Utilities', icon: '💡', color: '#FF9800', type: 'EXPENSE' },
  { name: 'Rent/Mortgage', icon: '🏠', color: '#795548', type: 'EXPENSE' },
  { name: 'Fuel', icon: '⛽', color: '#607D8B', type: 'EXPENSE' },
  { name: 'Dining', icon: '🍽️', color: '#E91E63', type: 'EXPENSE' },
  { name: 'Entertainment', icon: '🎬', color: '#9C27B0', type: 'EXPENSE' },
  { name: 'Medical', icon: '🏥', color: '#F44336', type: 'EXPENSE' },
  { name: 'Shopping', icon: '🛍️', color: '#2196F3', type: 'EXPENSE' },
  { name: 'Transport', icon: '🚌', color: '#00BCD4', type: 'EXPENSE' },
  { name: 'Education', icon: '📚', color: '#3F51B5', type: 'EXPENSE' },
  { name: 'Insurance', icon: '🛡️', color: '#009688', type: 'EXPENSE' },
  { name: 'Subscriptions', icon: '📱', color: '#673AB7', type: 'EXPENSE' },
  { name: 'Personal Care', icon: '💇', color: '#FF5722', type: 'EXPENSE' },
  { name: 'Gifts', icon: '🎁', color: '#CDDC39', type: 'EXPENSE' },
  { name: 'Other Expense', icon: '📦', color: '#9E9E9E', type: 'EXPENSE' },
  // Income categories
  { name: 'Salary', icon: '💰', color: '#4CAF50', type: 'INCOME' },
  { name: 'Freelance', icon: '💻', color: '#2196F3', type: 'INCOME' },
  { name: 'Business', icon: '🏢', color: '#FF9800', type: 'INCOME' },
  { name: 'Investment Returns', icon: '📈', color: '#8BC34A', type: 'INCOME' },
  { name: 'Rental Income', icon: '🏠', color: '#795548', type: 'INCOME' },
  { name: 'Interest', icon: '🏦', color: '#00BCD4', type: 'INCOME' },
  { name: 'Other Income', icon: '💵', color: '#9E9E9E', type: 'INCOME' },
];

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Groceries': ['supermarket', 'grocery', 'fresh', 'mart', 'bigbasket', 'dmart', 'reliance fresh', 'more', 'spar', 'walmart', 'costco'],
  'Utilities': ['electric', 'water', 'gas bill', 'internet', 'broadband', 'jio', 'airtel', 'bsnl', 'wifi', 'power'],
  'Fuel': ['petrol', 'diesel', 'fuel', 'gas station', 'hp', 'indian oil', 'bharat petroleum', 'shell', 'filling station'],
  'Dining': ['restaurant', 'cafe', 'zomato', 'swiggy', 'food', 'pizza', 'burger', 'biryani', 'hotel', 'dhaba', 'canteen'],
  'Entertainment': ['movie', 'netflix', 'spotify', 'hotstar', 'theater', 'cinema', 'gaming', 'prime video', 'disney'],
  'Medical': ['pharmacy', 'hospital', 'clinic', 'doctor', 'apollo', 'medplus', 'medicine', 'diagnostic', 'lab', 'health'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'mall', 'clothing', 'shoes', 'fashion', 'electronics', 'appliance'],
  'Transport': ['uber', 'ola', 'rapido', 'metro', 'bus', 'railway', 'train', 'taxi', 'auto', 'flight', 'airline'],
  'Education': ['school', 'college', 'course', 'udemy', 'book', 'tuition', 'coaching', 'university', 'exam', 'tutorial'],
  'Insurance': ['lic', 'insurance', 'premium', 'policy', 'health insurance', 'life insurance', 'car insurance'],
  'Subscriptions': ['subscription', 'monthly', 'annual plan', 'membership', 'gym', 'club'],
  'Rent/Mortgage': ['rent', 'mortgage', 'emi', 'home loan', 'house rent'],
  'Personal Care': ['salon', 'spa', 'haircut', 'beauty', 'grooming', 'cosmetic'],
};
