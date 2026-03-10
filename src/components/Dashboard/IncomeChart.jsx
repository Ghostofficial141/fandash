import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../UI/Card';

const data = [
    { name: 'Jan', fixed: 4000, variable: 2400 },
    { name: 'Feb', fixed: 3000, variable: 1398 },
    { name: 'Mar', fixed: 2000, variable: 9800 },
    { name: 'Apr', fixed: 2780, variable: 3908 },
    { name: 'May', fixed: 1890, variable: 4800 },
    { name: 'Jun', fixed: 2390, variable: 3800 },
    { name: 'Jul', fixed: 3490, variable: 4300 },
];

const IncomeChart = () => {
    const [period, setPeriod] = useState('This year');

    return (
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Total Income</h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="jm-input"
                    style={{ width: 'auto', padding: '0.4rem 1rem' }}
                >
                    <option>This month</option>
                    <option>Last 3 months</option>
                    <option>Last 6 months</option>
                    <option>This year</option>
                </select>
            </div>
            <div style={{ flex: 1, minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip cursor={{ fill: 'rgba(46, 58, 140, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                        <Bar dataKey="fixed" name="Fixed Income" fill="var(--jm-dark-blue)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="variable" name="Variable Income" fill="var(--jm-light-blue)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default IncomeChart;
