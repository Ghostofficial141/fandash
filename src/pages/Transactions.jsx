import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { useFinance } from '../context/FinanceContext';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import TransactionModal from '../components/Transactions/TransactionModal';

const Transactions = () => {
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTx, setEditingTx] = useState(null);

    // Filter transactions
    const filteredTxs = transactions.filter(tx => {
        const matchesSearch = tx.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filterType !== 'All' && tx.type !== filterType.toLowerCase()) return false;

        return matchesSearch;
    });

    const handleSave = (txData) => {
        if (editingTx) {
            updateTransaction({ ...txData, id: editingTx.id });
        } else {
            addTransaction(txData);
        }
    };

    const openAdd = () => {
        setEditingTx(null);
        setIsModalOpen(true);
    };

    const openEdit = (tx) => {
        setEditingTx(tx);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            deleteTransaction(id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#4caf50';
            case 'pending': return '#ff9800';
            case 'failed': return '#f44336';
            default: return 'var(--jm-dark-gray)';
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Transactions</h1>
                <Button onClick={openAdd}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Transaction</Button>
            </div>

            <Card style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 300px' }}>
                        <Search size={20} color="var(--jm-dark-gray)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <Input
                            placeholder="Search by name, ID, or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>
                    <select
                        className="jm-input"
                        style={{ flex: '0 0 200px' }}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="Income">Income</option>
                        <option value="Expense">Expense</option>
                    </select>
                </div>
            </Card>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--jm-light-gray)' }}>
                            <tr style={{ color: 'var(--jm-dark-gray)', fontSize: '0.875rem' }}>
                                <th style={{ padding: '1rem', fontWeight: '600' }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: '600' }}>Transaction ID</th>
                                <th style={{ padding: '1rem', fontWeight: '600' }}>Category</th>
                                <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: '600' }}>Date</th>
                                <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '1rem', fontWeight: '600', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTxs.map((tx, idx) => (
                                <tr key={tx.id} style={{ borderBottom: idx !== filteredTxs.length - 1 ? '1px solid var(--jm-light-gray)' : 'none' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '36px', height: '36px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--jm-light-gray)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '600', color: 'var(--jm-dark-blue)'
                                            }}>
                                                {tx.recipientName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{tx.recipientName}</div>
                                                {tx.notes && <div className="text-caption" style={{ color: 'var(--jm-dark-gray)' }}>{tx.notes}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--jm-dark-gray)', fontSize: '0.875rem' }}>#{tx.id}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{tx.category}</td>
                                    <td style={{ padding: '1rem' }}>
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
                                    <td style={{ padding: '1rem', color: 'var(--jm-dark-gray)', fontSize: '0.875rem' }}>
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: tx.type === 'income' ? '#4caf50' : 'var(--jm-black)' }}>
                                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => openEdit(tx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--jm-dark-blue)' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTxs.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--jm-dark-gray)' }}>
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingTx}
            />
        </div>
    );
};

export default Transactions;
