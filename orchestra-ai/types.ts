export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  riskScore?: number; // 0-100, assigned by AI
  riskReason?: string;
  isAnomaly?: boolean;
}

export interface CashflowPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  projected?: boolean; // true if this is an AI forecast
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: string;
  resolved: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar: string;
}

export interface IntegrationStatus {
  name: string;
  type: 'BANK' | 'ERP' | 'STRIPE';
  lastSynced: string;
  status: 'connected' | 'syncing' | 'error';
}
