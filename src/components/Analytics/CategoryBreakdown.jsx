import React from 'react';
import Card from '../UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useFinance } from '../../context/FinanceContext';

const COLORS = ['#2E3A8C', '#4A5FD9', '#1A2254', '#4A4A4A', '#8F9BDE', '#A9B2DF'];

const CategoryBreakdown = () => {
    const { transactions } = useFinance();

    // Calculate expenses by category
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    const data = Object.keys(expensesByCategory)
        .map(category => ({
            name: category,
            amount: expensesByCategory[category]
        }))
        .sort((a, b) => b.amount - a.amount); // Descending

    return (
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Category Breakdown</h3>

            <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E0E0E0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} />
                        <Tooltip
                            cursor={{ fill: 'rgba(46, 58, 140, 0.05)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`$${value}`, 'Amount']}
                        />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default CategoryBreakdown;
