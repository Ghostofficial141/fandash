import React from 'react';
import SpendingTrends from '../components/Analytics/SpendingTrends';
import CategoryBreakdown from '../components/Analytics/CategoryBreakdown';
import IncomeVsExpenses from '../components/Analytics/IncomeVsExpenses';
import TopExpenses from '../components/Analytics/TopExpenses';

const Analytics = () => {
    return (
        <div className="page-container">
            <h1 style={{ marginBottom: '2rem' }}>Analytics</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <SpendingTrends />
                <CategoryBreakdown />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <IncomeVsExpenses />
                <TopExpenses />
            </div>
        </div>
    );
};

export default Analytics;
