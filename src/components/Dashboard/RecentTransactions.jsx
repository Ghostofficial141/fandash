import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../UI/Card';
import { useFinance } from '../../context/FinanceContext';

const RecentTransactions = () => {
    const { transactions } = useFinance();
    const [filter, setFilter] = useState('All');

    // Simply show the latest 5 transactions for MVP
    const recentTxs = transactions.slice(0, 5);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#4caf50';
            case 'pending': return '#ff9800';
            case 'failed': return '#f44336';
            default: return 'var(--jm-dark-gray)';
        }
    };

    return (
        <Card style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Recent Transactions</h3>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="jm-input"
                        style={{ width: 'auto', padding: '0.4rem 1rem' }}
                    >
                        <option>This week</option>
                        <option>This month</option>
                        <option>All</option>
                    </select>
                    <Link to="/transactions" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--jm-dark-blue)' }}>See all</Link>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--jm-light-gray)', color: 'var(--jm-dark-gray)', fontSize: '0.875rem' }}>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Name</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Transaction ID</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>Date and time</th>
                            <th style={{ padding: '0.75rem 0.5rem', fontWeight: '500', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTxs.map(tx => (
                            <tr key={tx.id} style={{ borderBottom: '1px solid var(--jm-light-gray)' }}>
                                <td style={{ padding: '1rem 0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--jm-light-gray)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '600', color: 'var(--jm-dark-blue)',
                                            fontSize: '0.75rem'
                                        }}>
                                            {tx.recipientName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: '500' }}>{tx.recipientName}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--jm-dark-gray)' }}>#{tx.id}</td>
                                <td style={{ padding: '1rem 0.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        backgroundColor: `${getStatusColor(tx.status)}20`,
                                        color: getStatusColor(tx.status)
                                    }}>
                                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 0.5rem', color: 'var(--jm-dark-gray)' }}>
                                    {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '1rem 0.5rem', textAlign: 'right', fontWeight: '600', color: tx.type === 'income' ? '#4caf50' : 'var(--jm-black)' }}>
                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {recentTxs.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--jm-dark-gray)' }}>
                                    No recent transactions
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default RecentTransactions;
