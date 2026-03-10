import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';

const GoalModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        targetDate: new Date().toISOString().split('T')[0],
        currentAmount: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                targetDate: new Date(initialData.targetDate).toISOString().split('T')[0]
            });
        } else {
            setFormData({
                name: '',
                targetAmount: '',
                targetDate: new Date().toISOString().split('T')[0],
                currentAmount: 0
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
        if (!formData.name || !formData.targetAmount || !formData.targetDate) {
            alert("Please fill in required fields.");
            return;
        }

        onSave({
            ...formData,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: initialData ? initialData.currentAmount : (parseFloat(formData.currentAmount) || 0),
            targetDate: new Date(formData.targetDate).toISOString()
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <Card style={{ width: '100%', maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>{initialData ? 'Edit Goal' : 'Add Goal'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '1rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Goal Name</span>
                        <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. New Car" required />
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Amount</span>
                            <Input type="number" step="0.01" name="targetAmount" value={formData.targetAmount} onChange={handleChange} placeholder="0.00" required />
                        </label>
                        {!initialData && (
                            <label style={{ flex: 1 }}>
                                <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Initial Deposit (Opt)</span>
                                <Input type="number" step="0.01" name="currentAmount" value={formData.currentAmount} onChange={handleChange} placeholder="0.00" />
                            </label>
                        )}
                    </div>

                    <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Target Date</span>
                        <Input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} required />
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

export default GoalModal;
