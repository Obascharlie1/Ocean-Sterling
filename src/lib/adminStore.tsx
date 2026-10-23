'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type UserStatus = 'Active' | 'Suspended'
export type KYCStatus  = 'Verified' | 'Pending' | 'None'
export type TxStatus   = 'Pending' | 'Completed' | 'Rejected'
export type TxType     = 'Deposit' | 'Withdrawal'

export interface AdminUser {
  id:              string
  name:            string
  email:           string
  country:         string
  balance:         number
  profit:          number
  plan:            string
  status:          UserStatus
  joinDate:        string
  kycStatus:       KYCStatus
  kycDocType?:     string   // e.g. 'Passport', "Driver's License"
  kycSubmittedAt?: string
}

export interface AdminTx {
  id:      string
  userId:  string
  type:    TxType
  amount:  number
  method:  string
  date:    string
  status:  TxStatus
  note?:   string
}

/* ─── seed data ─────────────────────────────────────────────────────────── */

const USERS: AdminUser[] = [
  { id: 'u1', name: 'John Mitchell',   email: 'john@example.com',   country: 'United States', balance: 847392, profit: 647392, plan: 'Gold',     status: 'Active',    joinDate: 'Jan 10, 2025', kycStatus: 'Verified', kycDocType: 'Passport',          kycSubmittedAt: 'Jan 12, 2025' },
  { id: 'u2', name: 'Sarah Chen',      email: 'sarah@example.com',  country: 'Canada',        balance: 125840, profit: 45840,  plan: 'Silver',   status: 'Active',    joinDate: 'Feb 03, 2025', kycStatus: 'Pending',  kycDocType: "Driver's License",  kycSubmittedAt: 'Feb 05, 2025' },
  { id: 'u3', name: 'Marcus Williams', email: 'marcus@example.com', country: 'UK',            balance: 52100,  profit: 2100,   plan: 'Bronze',   status: 'Active',    joinDate: 'Mar 15, 2025', kycStatus: 'None'  },
  { id: 'u4', name: 'Elena Rodriguez', email: 'elena@example.com',  country: 'Spain',         balance: 310500, profit: 160500, plan: 'Platinum', status: 'Suspended', joinDate: 'Jan 28, 2025', kycStatus: 'Verified', kycDocType: 'National ID',       kycSubmittedAt: 'Jan 30, 2025' },
  { id: 'u5', name: 'David Park',      email: 'david@example.com',  country: 'South Korea',   balance: 0,      profit: 0,      plan: 'None',     status: 'Active',    joinDate: 'Apr 20, 2025', kycStatus: 'None'  },
  { id: 'u6', name: 'Priya Patel',     email: 'priya@example.com',  country: 'India',         balance: 234750, profit: 114750, plan: 'Gold',     status: 'Active',    joinDate: 'Feb 14, 2025', kycStatus: 'Verified', kycDocType: 'Passport',          kycSubmittedAt: 'Feb 16, 2025' },
]

const TRANSACTIONS: AdminTx[] = [
  { id: 'T001', userId: 'u1', type: 'Deposit',    amount: 50000,  method: 'Bank Transfer', date: 'Jan 15, 2025', status: 'Completed' },
  { id: 'T002', userId: 'u1', type: 'Deposit',    amount: 25000,  method: 'Bitcoin',       date: 'Feb 01, 2025', status: 'Completed' },
  { id: 'T003', userId: 'u1', type: 'Withdrawal', amount: 8500,   method: 'Bank Transfer', date: 'Feb 10, 2025', status: 'Completed' },
  { id: 'T004', userId: 'u1', type: 'Deposit',    amount: 125000, method: 'Wire Transfer', date: 'Mar 01, 2025', status: 'Completed' },
  { id: 'T005', userId: 'u1', type: 'Withdrawal', amount: 20000,  method: 'PayPal',        date: 'Mar 18, 2025', status: 'Completed' },
  { id: 'T006', userId: 'u1', type: 'Withdrawal', amount: 15000,  method: 'Bank Transfer', date: 'Apr 28, 2025', status: 'Pending'   },
  { id: 'T007', userId: 'u2', type: 'Deposit',    amount: 80000,  method: 'Wire Transfer', date: 'Feb 03, 2025', status: 'Completed' },
  { id: 'T008', userId: 'u2', type: 'Deposit',    amount: 15000,  method: 'Bitcoin',       date: 'May 20, 2025', status: 'Pending'   },
  { id: 'T009', userId: 'u2', type: 'Withdrawal', amount: 20000,  method: 'Wire Transfer', date: 'May 18, 2025', status: 'Pending'   },
  { id: 'T010', userId: 'u3', type: 'Deposit',    amount: 50000,  method: 'Bitcoin',       date: 'Mar 15, 2025', status: 'Completed' },
  { id: 'T011', userId: 'u3', type: 'Deposit',    amount: 5000,   method: 'Bitcoin',       date: 'May 19, 2025', status: 'Pending'   },
  { id: 'T012', userId: 'u4', type: 'Deposit',    amount: 150000, method: 'Bank Transfer', date: 'Jan 28, 2025', status: 'Completed' },
  { id: 'T013', userId: 'u4', type: 'Withdrawal', amount: 30000,  method: 'Bank Transfer', date: 'Mar 05, 2025', status: 'Completed' },
  { id: 'T014', userId: 'u6', type: 'Deposit',    amount: 120000, method: 'Wire Transfer', date: 'Feb 14, 2025', status: 'Completed' },
  { id: 'T015', userId: 'u6', type: 'Withdrawal', amount: 15000,  method: 'Bank Transfer', date: 'Apr 22, 2025', status: 'Pending'   },
]

/* ─── context ────────────────────────────────────────────────────────────── */

interface Store {
  users:              AdminUser[]
  transactions:       AdminTx[]
  updateBalance:      (userId: string, balance: number) => void
  updateProfit:       (userId: string, profit: number)  => void
  suspendUser:        (userId: string) => void
  activateUser:       (userId: string) => void
  deleteUser:         (userId: string) => void
  approveTransaction: (txId: string)  => void
  rejectTransaction:  (txId: string)  => void
  createDeposit:      (userId: string, amount: number, method: string, note: string) => void
}

const Ctx = createContext<Store | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users,        setUsers]        = useState<AdminUser[]>(USERS)
  const [transactions, setTransactions] = useState<AdminTx[]>(TRANSACTIONS)

  function updateBalance(userId: string, balance: number) {
    setUsers(u => u.map(x => x.id === userId ? { ...x, balance } : x))
  }

  function updateProfit(userId: string, profit: number) {
    setUsers(u => u.map(x => x.id === userId ? { ...x, profit } : x))
  }

  function suspendUser(userId: string) {
    setUsers(u => u.map(x => x.id === userId ? { ...x, status: 'Suspended' } : x))
  }

  function activateUser(userId: string) {
    setUsers(u => u.map(x => x.id === userId ? { ...x, status: 'Active' } : x))
  }

  function deleteUser(userId: string) {
    setUsers(u => u.filter(x => x.id !== userId))
    setTransactions(t => t.filter(x => x.userId !== userId))
  }

  function approveTransaction(txId: string) {
    const tx = transactions.find(t => t.id === txId)
    if (!tx || tx.status !== 'Pending') return
    setTransactions(t => t.map(x => x.id === txId ? { ...x, status: 'Completed' } : x))
    setUsers(u => u.map(x => {
      if (x.id !== tx.userId) return x
      return {
        ...x,
        balance: tx.type === 'Deposit'
          ? x.balance + tx.amount
          : Math.max(0, x.balance - tx.amount),
      }
    }))
  }

  function rejectTransaction(txId: string) {
    setTransactions(t => t.map(x => x.id === txId ? { ...x, status: 'Rejected' } : x))
  }

  function createDeposit(userId: string, amount: number, method: string, note: string) {
    const now = new Date()
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const newTx: AdminTx = {
      id:     `T${Date.now()}`,
      userId,
      type:   'Deposit',
      amount,
      method,
      date,
      status: 'Completed',
      note:   note || undefined,
    }
    setTransactions(t => [newTx, ...t])
    setUsers(u => u.map(x => x.id === userId ? { ...x, balance: x.balance + amount } : x))
  }

  return (
    <Ctx.Provider value={{
      users, transactions,
      updateBalance, updateProfit, suspendUser, activateUser, deleteUser,
      approveTransaction, rejectTransaction, createDeposit,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
