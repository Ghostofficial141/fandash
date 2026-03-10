import React, { useState } from 'react';
import Card from '../UI/Card';
import { useFinance } from '../../context/FinanceContext';

const YearlySummary = () => {
    const { transactions } = useFinance();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const yearTxs = transactions.filter(t => new Date(t.date).getFullYear() === selectedYear);

    const annualIncome = yearTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const annualExpenses = yearTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const annualSavings = annualIncome - annualExpenses;

    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const mTxs = yearTxs.filter(t => new Date(t.date).getMonth() === i);
        const inc = mTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const exp = mTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return {
            month: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
            income: inc,
            expense: exp,
            savings: inc - exp
        };
    });

    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Yearly Summary</h3>
                <select className="jm-input" style={{ width: 'auto' }} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                    {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <div className="text-small" style={{ color: 'var(--jm-dark-gray)' }}>Total Income</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4caf50' }}>${annualIncome.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-small" style={{ color: 'var(--jm-dark-gray)' }}>Total Expenses</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#f44336' }}>${annualExpenses.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-small" style={{ color: 'var(--jm-dark-gray)' }}>Net Savings</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--jm-dark-blue)' }}>${annualSavings.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--jm-light-gray)', color: 'var(--jm-dark-gray)', fontSize: '0.875rem' }}>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Month</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500', textAlign: 'right' }}>Income</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500', textAlign: 'right' }}>Expenses</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500', textAlign: 'right' }}>Savings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((data) => (
                            <tr key={data.month} style={{ borderBottom: '1px solid var(--jm-light-gray)' }}>
                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>{data.month}</td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: data.income > 0 ? '#4caf50' : 'inherit' }}>
                                    ${data.income.toLocaleString()}
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: data.expense > 0 ? '#f44336' : 'inherit' }}>
                                    ${data.expense.toLocaleString()}
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '600', color: data.savings >= 0 ? 'var(--jm-black)' : '#f44336' }}>
                                    ${data.savings.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default YearlySummary;
