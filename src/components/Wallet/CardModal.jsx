import React, { useState, useEffect } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';

const CardModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardholderName: '',
        expiryDate: '',
        cardType: 'visa',
        nickname: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                cardNumber: '',
                cardholderName: '',
                expiryDate: '',
                cardType: 'visa',
                nickname: ''
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
        if (!formData.cardNumber || !formData.cardholderName || !formData.expiryDate) {
            alert("Please fill in required fields.");
            return;
        }

        // Mask the card number if it isn't already masked
        let finalCardNumber = formData.cardNumber;
        if (!finalCardNumber.includes('*') && finalCardNumber.length >= 4) {
            finalCardNumber = `**** **** **** ${finalCardNumber.slice(-4)}`;
        } else if (!finalCardNumber.includes('*') && finalCardNumber.length < 4) {
            finalCardNumber = `**** **** **** ${finalCardNumber.padStart(4, '0')}`;
        }

        onSave({
            ...formData,
            cardNumber: finalCardNumber
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <Card style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>{initialData ? 'Edit Card' : 'Add Card'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: '1rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Card Number (or last 4)</span>
                        <Input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="e.g. 4242" required />
                    </label>

                    <label style={{ display: 'block', marginBottom: '1rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Cardholder Name</span>
                        <Input type="text" name="cardholderName" value={formData.cardholderName} onChange={handleChange} placeholder="e.g. JOHN DOE" style={{ textTransform: 'uppercase' }} required />
                    </label>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Expiry Date</span>
                            <Input type="text" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" required />
                        </label>
                        <label style={{ flex: 1 }}>
                            <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Card Network</span>
                            <select name="cardType" className="jm-input" value={formData.cardType} onChange={handleChange}>
                                <option value="visa">Visa</option>
                                <option value="mastercard">Mastercard</option>
                                <option value="amex">Amex</option>
                                <option value="other">Other</option>
                            </select>
                        </label>
                    </div>

                    <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                        <span className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Nickname (Optional)</span>
                        <Input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="e.g. Groceries Card" />
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

export default CardModal;
