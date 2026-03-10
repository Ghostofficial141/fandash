import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';

const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        recipientName: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'completed'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date: new Date(initialData.date).toISOString().split('T')[0]
            });
        } else {
            setFormData({
                type: 'expense',
                amount: '',
                category: '',
                recipientName: '',
                date: new Date().toISOString().split('T')[0],
                notes: '',
                status: 'completed'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.recipientName || !formData.amount || !formData.category) {
            alert("Please fill in required fields: Name, Amount, Category");
            return;
        }

        onSave({
            ...formData,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date).toISOString()
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <Card style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Type</span>
                            <select name="type" className="jm-input" value={formData.type} onChange={handleChange}>
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </label>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Status</span>
                            <select name="status" className="jm-input" value={formData.status} onChange={handleChange}>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </label>
                    </div>

                    <label style={{ display: 'block', marginBottom: '1rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Amount</span>
                        <Input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" required />
                    </label>

                    <label style={{ display: 'block', marginBottom: '1rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Recipient/Source Name</span>
                        <Input type="text" name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="e.g. Amazon" required />
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Category</span>
                            <Input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Food, Travel, etc." required />
                        </label>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Date</span>
                            <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </label>
                    </div>

                    <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Notes (Optional)</span>
                        <Input type="text" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Add a note" />
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default TransactionModal;
