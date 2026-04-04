import React from 'react';
import { ArrowLeft, Calendar, CreditCard, TrendingDown, TrendingUp, IndianRupee, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useStatement } from '../../context/StatementContext';
import CategoryBreakdown from './CategoryBreakdown';
import TopMerchants from './TopMerchants';

const PIE_COLORS = [
  '#3867d6', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6',
  '#e67e22', '#1abc9c', '#3498db', '#fc5c65', '#95a5a6',
];

const SpendingAnalytics = () => {
  const { analytics, resetStatement } = useStatement();
  if (!analytics) return null;

  const { summary, categoryBreakdown: categories, topMerchants, dailySpending, incomeSources } = analytics;
  const fileName = analytics.fileName || 'Uploaded Statement';
  const uploadDate = analytics.uploadedAt || analytics.uploadDate || new Date().toISOString();

  const formatCurrency = (val) =>
    `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  const netSavings = summary.totalIncome - summary.totalExpense;

  // Prepare pie chart data from categories
  const pieData = categories.map((cat) => ({
    name: cat.name,
    value: cat.total,
  }));

  // Prepare daily spending bar chart data
  const dailyData = (dailySpending || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    amount: d.total,
  }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="stmt-analytics-header">
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Statement Analytics</h1>
          <div className="stmt-meta">
            <span>📄 {fileName}</span>
            <span>•</span>
            <span><Calendar size={13} style={{ verticalAlign: '-2px' }} /> {new Date(uploadDate).toLocaleDateString('en-IN')}</span>
            {summary.dateRange?.from && (
              <>
                <span>•</span>
                <span>
                  {new Date(summary.dateRange.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' → '}
                  {new Date(summary.dateRange.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </>
            )}
          </div>
        </div>
        <button className="stmt-new-upload-btn" onClick={resetStatement}>
          <ArrowLeft size={16} />
          New Upload
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stmt-summary-grid">
        <div className="stmt-summary-card expense">
          <div className="stmt-summary-icon" style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' }}>
            <ArrowUpRight size={20} />
          </div>
          <div>
            <div className="stmt-summary-label">Total Spent</div>
            <div className="stmt-summary-value" style={{ color: '#e74c3c' }}>{formatCurrency(summary.totalExpense)}</div>
          </div>
        </div>
        <div className="stmt-summary-card income">
          <div className="stmt-summary-icon" style={{ background: 'rgba(39, 174, 96, 0.15)', color: '#27ae60' }}>
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <div className="stmt-summary-label">Total Income</div>
            <div className="stmt-summary-value" style={{ color: '#27ae60' }}>{formatCurrency(summary.totalIncome)}</div>
          </div>
        </div>
        <div className="stmt-summary-card net">
          <div className="stmt-summary-icon" style={{
            background: netSavings >= 0 ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
            color: netSavings >= 0 ? '#27ae60' : '#e74c3c',
          }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <div className="stmt-summary-label">Net Flow</div>
            <div className="stmt-summary-value" style={{ color: netSavings >= 0 ? '#27ae60' : '#e74c3c' }}>
              {netSavings >= 0 ? '+' : ''}{formatCurrency(Math.abs(netSavings))}
            </div>
          </div>
        </div>
        <div className="stmt-summary-card count">
          <div className="stmt-summary-icon" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db' }}>
            <CreditCard size={20} />
          </div>
          <div>
            <div className="stmt-summary-label">Transactions</div>
            <div className="stmt-summary-value">{summary.transactionCount}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="stmt-charts-grid">
        <CategoryBreakdown categories={categories} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TopMerchants merchants={topMerchants} />

          {/* Income Sources */}
          {incomeSources && incomeSources.length > 0 && (
            <div className="stmt-chart-card">
              <div className="stmt-chart-title">Income Sources</div>
              <ul className="stmt-cat-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {incomeSources.map((src, i) => (
                  <li key={i}>
                    <div className="stmt-cat-item" style={{ cursor: 'default' }}>
                      <div className="stmt-cat-icon" style={{ background: '#27ae60', fontSize: '0.9rem' }}>💰</div>
                      <div style={{ flex: 1 }}>
                        <div className="stmt-cat-name">{src.name}</div>
                        <div className="stmt-cat-count">{src.count} transfer{src.count !== 1 ? 's' : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="stmt-cat-amount" style={{ color: '#27ae60' }}>+{formatCurrency(src.total)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Chart */}
      {dailyData.length > 1 && (
        <div className="stmt-chart-card" style={{ marginTop: '1.5rem' }}>
          <div className="stmt-chart-title">Daily Spending</div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--jm-border, #eee)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{
                    background: 'var(--jm-card-bg, #fff)',
                    border: '1px solid var(--jm-border, #eee)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="amount" fill="#3867d6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spending Breakdown Pie Chart */}
      {pieData.length > 0 && (
        <div className="stmt-chart-card" style={{ marginTop: '1.5rem' }}>
          <div className="stmt-chart-title">Spending Distribution</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: 'var(--jm-dark-gray, #666)' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{
                    background: 'var(--jm-card-bg, #fff)',
                    border: '1px solid var(--jm-border, #eee)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="stmt-chart-card" style={{ marginTop: '1.5rem' }}>
        <div className="stmt-chart-title">All Transactions</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="stmt-txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Payee</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {analytics.transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{txn.recipientName}</div>
                    {txn.rawDescription && (
                      <div style={{ fontSize: '0.7rem', opacity: 0.45, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {txn.rawDescription}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`stmt-badge ${txn.type === 'income' ? 'income' : 'expense'}`}>
                      {txn.category}
                    </span>
                  </td>
                  <td>
                    <span className={`stmt-badge ${txn.type}`}>
                      {txn.type === 'income' ? '↓ In' : '↑ Out'}
                    </span>
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    color: txn.type === 'income' ? '#27ae60' : '#e74c3c',
                  }}>
                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalytics;
