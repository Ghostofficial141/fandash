import React, { useState } from 'react';
import Card from '../UI/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Week 1', spending: 400 },
    { name: 'Week 2', spending: 300 },
    { name: 'Week 3', spending: 550 },
    { name: 'Week 4', spending: 200 },
];

const SpendingTrends = () => {
    const [period, setPeriod] = useState('Monthly');

    return (
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Spending Trends</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="jm-input"
                    style={{ width: 'auto', padding: '0.4rem 1rem' }}
                >
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                </select>
            </div>

            <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`$${value}`, 'Spending']}
                        />
                        <Line type="monotone" dataKey="spending" stroke="var(--jm-dark-blue)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default SpendingTrends;
