import React from 'react';

const TopMerchants = ({ merchants }) => {
  if (!merchants || merchants.length === 0) return null;

  const maxTotal = merchants[0]?.total || 1;

  const formatCurrency = (val) =>
    `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  return (
    <div className="stmt-chart-card">
      <div className="stmt-chart-title">Top Merchants</div>

      <ul className="stmt-merchant-list">
        {merchants.map((m, i) => (
          <li key={m.name} className="stmt-merchant-item">
            <div className={`stmt-merchant-rank${i < 3 ? ' top-3' : ''}`}>
              {i + 1}
            </div>

            <div className="stmt-merchant-info">
              <div className="stmt-merchant-name">{m.name}</div>
              <div className="stmt-merchant-count">
                {m.count} transaction{m.count !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="stmt-merchant-amount">{formatCurrency(m.total)}</div>

            <div className="stmt-merchant-bar">
              <div
                className="stmt-merchant-bar-fill"
                style={{ width: `${(m.total / maxTotal) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopMerchants;
