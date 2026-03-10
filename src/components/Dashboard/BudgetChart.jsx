import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../UI/Card';
import { useFinance } from '../../context/FinanceContext';

const COLORS = ['#2E3A8C', '#4A5FD9', '#1A2254', '#4A4A4A', '#8F9BDE'];

const BudgetChart = () => {
    const { budgets } = useFinance();
    const [period, setPeriod] = useState('This month');

    // Currently just using the mock budgets which is for "This month"
    const chartData = budgets.map(b => ({
        name: b.category,
        value: b.spentAmount > 0 ? b.spentAmount : 1, // Add 1 so empty allocations still render slightly or just use 0
        actualValue: b.spentAmount,
        allocated: b.allocatedAmount
    })).filter(b => b.actualValue > 0);

    // If nothing spent, show empty state or full budget
    const displayData = chartData.length > 0 ? chartData : [{ name: 'Unspent', value: 1, actualValue: 0 }];

    const totalBudget = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
                    <p style={{ margin: 0 }}>Spent: ${payload[0].payload.actualValue}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Budget</h3>
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

            <div style={{ flex: 1, minHeight: '250px', position: 'relative' }}>
                {/* Center Text */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--jm-dark-blue)' }}>
                        ${totalSpent}
                    </div>
                    <div className="text-caption">of ${totalBudget}</div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {displayData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BudgetChart;
