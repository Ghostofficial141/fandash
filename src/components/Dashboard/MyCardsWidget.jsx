import React from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { useFinance } from '../../context/FinanceContext';

const MyCardsWidget = () => {
    const { cards } = useFinance();

    return (
        <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>My Cards</h3>
                <Button variant="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Add Card</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cards.length > 0 ? (
                    cards.map(card => (
                        <div key={card.id} style={{
                            backgroundColor: card.cardType === 'visa' ? 'var(--jm-dark-blue)' : 'var(--jm-navy)',
                            color: 'white',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative circle */}
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <span style={{ fontWeight: '600', letterSpacing: '1px' }}>{card.cardType.toUpperCase()}</span>
                                <span className="text-caption">Contactless</span>
                            </div>

                            <div style={{ fontSize: '1.25rem', letterSpacing: '2px', marginBottom: '1rem' }}>
                                {card.cardNumber}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span>{card.cardholderName}</span>
                                <span>{card.expiryDate}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--jm-dark-gray)' }}>
                        No cards added yet
                    </div>
                )}
            </div>
        </Card>
    );
};

export default MyCardsWidget;
