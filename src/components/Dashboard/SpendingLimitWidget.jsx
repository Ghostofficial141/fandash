import React from 'react';
import Card from '../UI/Card';
import { useFinance } from '../../context/FinanceContext';

const SpendingLimitWidget = () => {
    const { user, transactions } = useFinance();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const spentThisMonth = transactions
        .filter(t => t.type === 'expense')
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const limit = user.monthlySpendingLimit || 0;
    const percentage = limit > 0 ? Math.min((spentThisMonth / limit) * 100, 100) : 0;

    let progressColor = 'var(--jm-dark-blue)';
    if (percentage > 90) progressColor = '#f44336';
    else if (percentage > 75) progressColor = '#ff9800';

    return (
        <Card>
            <h3 style={{ marginBottom: '1.5rem' }}>Monthly Spending Limit</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--jm-dark-gray)', fontWeight: '500' }}>Spent</span>
                <span style={{ fontWeight: '600' }}>${spentThisMonth.toLocaleString()}</span>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--jm-light-gray)', borderRadius: '4px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: progressColor, borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--jm-dark-gray)' }}>0</span>
                <span style={{ color: 'var(--jm-dark-gray)' }}>Limit: ${limit.toLocaleString()}</span>
            </div>
        </Card>
    );
};

export default SpendingLimitWidget;
