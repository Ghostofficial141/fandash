import React, { useState } from 'react';
import Card from '../UI/Card';
import { useFinance } from '../../context/FinanceContext';

const TopExpenses = () => {
    const { transactions } = useFinance();
    const [period, setPeriod] = useState('This month');

    // Basic sorting to find top expenses
    const topExpenses = [...transactions]
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    return (
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Top Expenses</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="jm-input"
                    style={{ width: 'auto', padding: '0.4rem 1rem' }}
                >
                    <option>This month</option>
                    <option>Last month</option>
                    <option>This year</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topExpenses.map((expense, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx !== topExpenses.length - 1 ? '1px solid var(--jm-light-gray)' : 'none' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                                width: '40px', height: '40px', backgroundColor: 'var(--jm-light-gray)', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--jm-dark-blue)', fontWeight: '600'
                            }}>
                                {expense.recipientName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontWeight: '500' }}>{expense.recipientName}</div>
                                <div className="text-caption" style={{ color: 'var(--jm-dark-gray)' }}>{expense.category} • {new Date(expense.date).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                            ${expense.amount.toLocaleString()}
                        </div>
                    </div>
                ))}

                {topExpenses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--jm-dark-gray)' }}>
                        No expenses found
                    </div>
                )}
            </div>
        </Card>
    );
};

export default TopExpenses;
