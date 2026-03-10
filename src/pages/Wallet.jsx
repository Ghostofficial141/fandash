import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useFinance } from '../context/FinanceContext';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CardModal from '../components/Wallet/CardModal';

const Wallet = () => {
    const { cards, setCards } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    const handleSave = (cardData) => {
        if (editingCard) {
            setCards(cards.map(c => c.id === editingCard.id ? { ...c, ...cardData } : c));
        } else {
            setCards([...cards, { ...cardData, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
        }
    };

    const openAdd = () => {
        setEditingCard(null);
        setIsModalOpen(true);
    };

    const openEdit = (card) => {
        setEditingCard(card);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this card?")) {
            setCards(cards.filter(c => c.id !== id));
        }
    };

    const getCardBackground = (type) => {
        switch (type.toLowerCase()) {
            case 'visa': return 'var(--jm-dark-blue)';
            case 'mastercard': return '#eb001b'; // Approximate Mastercard red/orange
            case 'amex': return '#0070ce';
            default: return 'var(--jm-navy)';
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Wallet</h1>
                <Button onClick={openAdd}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Card</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {cards.map(card => (
                    <div key={card.id} style={{ position: 'relative' }}>
                        <div style={{
                            backgroundColor: getCardBackground(card.cardType),
                            color: 'white',
                            padding: '2rem',
                            borderRadius: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                            minHeight: '220px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '2px' }}>{card.cardType.toUpperCase()}</div>
                                    {card.nickname && <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.25rem' }}>{card.nickname}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => openEdit(card)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer', color: 'white' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(card.id)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '4px', padding: '0.4rem', cursor: 'pointer', color: 'white' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ fontSize: '1.75rem', letterSpacing: '4px', margin: '1.5rem 0', fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>
                                {card.cardNumber}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>Card Holder</div>
                                    <div style={{ fontWeight: '500', letterSpacing: '1px' }}>{card.cardholderName}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>Expires</div>
                                    <div style={{ fontWeight: '500' }}>{card.expiryDate}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {cards.length === 0 && (
                    <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--jm-dark-gray)' }}>
                        <div style={{ marginBottom: '1rem' }}>No cards saved in your wallet.</div>
                        <Button variant="secondary" onClick={openAdd}>Add your first card</Button>
                    </Card>
                )}
            </div>

            <CardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingCard}
            />
        </div>
    );
};

export default Wallet;
