import React from 'react';
import Card from '../components/UI/Card';
import { useFinance } from '../context/FinanceContext';
import IncomeChart from '../components/Dashboard/IncomeChart';
import BudgetChart from '../components/Dashboard/BudgetChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import SpendingLimitWidget from '../components/Dashboard/SpendingLimitWidget';
import MyCardsWidget from '../components/Dashboard/MyCardsWidget';

const Dashboard = () => {
    const { calcDashboardMetrics } = useFinance();
    const metrics = calcDashboardMetrics();

    return (
        <div className="page-container">
            <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

            {/* Key Metrics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Card>
                    <div className="text-small">Total Balance</div>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>${metrics.totalBalance.toLocaleString()}</h2>
                    <div className="text-caption" style={{ color: metrics.balanceChange >= 0 ? 'green' : 'red' }}>
                        {metrics.balanceChange >= 0 ? '+' : ''}{metrics.balanceChange}% from last month
                    </div>
                </Card>

                <Card>
                    <div className="text-small">Income</div>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>${metrics.income.toLocaleString()}</h2>
                    <div className="text-caption" style={{ color: metrics.incomeChange >= 0 ? 'green' : 'red' }}>
                        {metrics.incomeChange >= 0 ? '+' : ''}{metrics.incomeChange}% from last month
                    </div>
                </Card>

                <Card>
                    <div className="text-small">Expense</div>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>${metrics.expense.toLocaleString()}</h2>
                    <div className="text-caption" style={{ color: metrics.expenseChange <= 0 ? 'green' : 'red' }}>
                        {metrics.expenseChange > 0 ? '+' : ''}{metrics.expenseChange}% from last month
                    </div>
                </Card>

                <Card>
                    <div className="text-small">Total Savings</div>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>${metrics.totalSavings.toLocaleString()}</h2>
                    <div className="text-caption" style={{ color: metrics.savingsChange >= 0 ? 'green' : 'red' }}>
                        {metrics.savingsChange >= 0 ? '+' : ''}{metrics.savingsChange}% from last month
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <IncomeChart />
                <BudgetChart />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <RecentTransactions />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <SpendingLimitWidget />
                    <MyCardsWidget />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
