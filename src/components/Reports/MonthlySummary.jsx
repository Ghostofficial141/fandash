import React, { useState } from 'react';
import Card from '../UI/Card';
import { useFinance } from '../../context/FinanceContext';

const MonthlySummary = () => {
    const { transactions } = useFinance();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const monthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = income - expenses;
    const numTransactions = monthTxs.length;

    const topCategories = Object.entries(
        monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 3);

    return (
        <Card style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3>Monthly Summary</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select className="jm-input" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <select className="jm-input" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--jm-light-gray)', borderRadius: '8px' }}>
                    <div className="text-small" style={{ marginBottom: '0.5rem' }}>Total Income</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4caf50' }}>${income.toLocaleString()}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--jm-light-gray)', borderRadius: '8px' }}>
                    <div className="text-small" style={{ marginBottom: '0.5rem' }}>Total Expenses</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f44336' }}>${expenses.toLocaleString()}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--jm-light-gray)', borderRadius: '8px' }}>
                    <div className="text-small" style={{ marginBottom: '0.5rem' }}>Net Savings</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--jm-dark-blue)' }}>${netSavings.toLocaleString()}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: 'var(--jm-light-gray)', borderRadius: '8px' }}>
                    <div className="text-small" style={{ marginBottom: '0.5rem' }}>Transactions</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{numTransactions}</div>
                </div>
            </div>

            <div>
                <h4 style={{ marginBottom: '1rem' }}>Top Spending Categories</h4>
                {topCategories.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topCategories.map(([category, amount]) => (
                            <div key={category} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--jm-light-gray)' }}>
                                <span>{category}</span>
                                <span style={{ fontWeight: '600' }}>${amount.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: 'var(--jm-dark-gray)' }}>No expenses recorded for this month.</div>
                )}
            </div>
        </Card>
    );
};

export default MonthlySummary;
