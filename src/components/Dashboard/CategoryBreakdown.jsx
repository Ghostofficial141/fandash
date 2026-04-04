import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = {
  'Food & Grocery': '#e74c3c',
  'Transportation': '#3498db',
  'Entertainment': '#9b59b6',
  'Shopping': '#e67e22',
  'Bills & Utilities': '#1abc9c',
  'Healthcare': '#2ecc71',
  'Subscriptions': '#f39c12',
  'Education': '#2980b9',
  'Travel': '#16a085',
  'Investment': '#8e44ad',
  'UPI Transfer': '#3867d6',
  'Bank Transfer': '#4b7bec',
  'Cash Withdrawal': '#fc5c65',
  'Loan/EMI': '#eb3b5a',
  'Other': '#95a5a6',
};

const CATEGORY_ICONS = {
  'Food & Grocery': '🍔',
  'Transportation': '🚗',
  'Entertainment': '🎬',
  'Shopping': '🛒',
  'Bills & Utilities': '💡',
  'Healthcare': '🏥',
  'Subscriptions': '📱',
  'Education': '📚',
  'Travel': '✈️',
  'Investment': '📈',
  'UPI Transfer': '📲',
  'Bank Transfer': '🏦',
  'Cash Withdrawal': '💵',
  'Loan/EMI': '🏠',
  'Other': '📌',
};

const CategoryBreakdown = ({ categories }) => {
  const [expanded, setExpanded] = useState(null);

  const toggle = (name) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const formatCurrency = (val) =>
    `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

  return (
    <div className="stmt-chart-card">
      <div className="stmt-chart-title">Category Breakdown</div>

      <ul className="stmt-cat-list">
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat.name] || '#95a5a6';
          const icon = CATEGORY_ICONS[cat.name] || '📌';
          const isOpen = expanded === cat.name;

          return (
            <li key={cat.name}>
              <div className="stmt-cat-item" onClick={() => toggle(cat.name)}>
                <div
                  className="stmt-cat-icon"
                  style={{ background: color }}
                >
                  {icon}
                </div>

                <div>
                  <div className="stmt-cat-name">{cat.name}</div>
                  <div className="stmt-cat-count">{cat.count} transaction{cat.count !== 1 ? 's' : ''}</div>
                  <div className="stmt-cat-bar-wrap" style={{ marginTop: '0.35rem' }}>
                    <div
                      className="stmt-cat-bar"
                      style={{ width: `${cat.percentage}%`, background: color }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="stmt-cat-amount">{formatCurrency(cat.total)}</div>
                  <div className="stmt-cat-pct">{cat.percentage}%</div>
                </div>

                <div style={{ color: 'var(--jm-dark-gray)', opacity: 0.5 }}>
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>

              {isOpen && (
                <div className="stmt-cat-expanded">
                  {cat.transactions.map((txn) => (
                    <div key={txn.id} className="stmt-cat-txn">
                      <div style={{ flex: 1 }}>
                        <span className="stmt-cat-txn-name">{txn.recipientName}</span>
                        {txn.rawDescription && (
                          <div className="stmt-cat-txn-desc" style={{
                            fontSize: '0.7rem',
                            opacity: 0.5,
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '300px',
                          }}>
                            {txn.rawDescription}
                          </div>
                        )}
                      </div>
                      <span className="stmt-cat-txn-amount">{formatCurrency(txn.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryBreakdown;
