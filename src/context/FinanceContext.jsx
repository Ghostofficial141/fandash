import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mockUser, mockTransactions, mockCards, mockGoals, mockBudget } from '../utils/mockData';

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
    const [user, setUser] = useLocalStorage('jm_finance_user', mockUser);
    const [transactions, setTransactions] = useLocalStorage('jm_finance_transactions', mockTransactions);
    const [cards, setCards] = useLocalStorage('jm_finance_cards', mockCards);
    const [goals, setGoals] = useLocalStorage('jm_finance_goals', mockGoals);
    const [budgets, setBudgets] = useLocalStorage('jm_finance_budgets', mockBudget);
    const [isDark, setIsDark] = useLocalStorage('jm_finance_dark_mode', false);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }, [isDark]);

    // Helper functions for transactions
    const addTransaction = (transaction) => {
        const newTx = {
            ...transaction,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        setTransactions([newTx, ...transactions]);

        // Auto-update budget if expense and matched category
        if (newTx.type === 'expense') {
            const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');

            setBudgets(prev => prev.map(b => {
                if (b.category === newTx.category && b.month === currentMonth) {
                    return { ...b, spentAmount: b.spentAmount + newTx.amount };
                }
                return b;
            }));
        }
    };

    const deleteTransaction = (id) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const updateTransaction = (updatedTx) => {
        setTransactions(transactions.map(t => (t.id === updatedTx.id ? updatedTx : t)));
    };

    const calcDashboardMetrics = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const income = currentMonthTxs
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = currentMonthTxs
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Total balance spans all time by default
        const totalBalance = transactions.reduce((sum, t) => {
            return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);

        const totalSavings = income - expense;

        // A real app would compare to last month for % change, but returning 0 for simplicity right now
        return {
            totalBalance,
            income,
            expense,
            totalSavings,
            incomeChange: 5.2, // Mocked percentage changes
            expenseChange: -2.1,
            balanceChange: 3.4,
            savingsChange: 8.7
        };
    };

    const value = {
        user,
        setUser,
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        cards,
        setCards,
        goals,
        setGoals,
        budgets,
        setBudgets,
        calcDashboardMetrics,
        isDark,
        setIsDark
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
}

export function useFinance() {
    const context = useContext(FinanceContext);
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
}
