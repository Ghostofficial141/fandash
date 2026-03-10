import React, { useState } from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useFinance } from '../context/FinanceContext';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import GoalModal from '../components/Goals/GoalModal';
import AddMoneyModal from '../components/Goals/AddMoneyModal';

const Goals = () => {
    const { goals, setGoals } = useFinance();

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [activeGoal, setActiveGoal] = useState(null);

    const handleSaveGoal = (goalData) => {
        if (editingGoal) {
            setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g));
        } else {
            setGoals([...goals, { ...goalData, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
        }
    };

    const handleAddMoney = (amount) => {
        if (activeGoal) {
            setGoals(goals.map(g => g.id === activeGoal.id ? { ...g, currentAmount: g.currentAmount + amount } : g));
        }
    };

    const openAdd = () => {
        setEditingGoal(null);
        setIsGoalModalOpen(true);
    };

    const openEdit = (goal) => {
        setEditingGoal(goal);
        setIsGoalModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this goal?")) {
            setGoals(goals.filter(g => g.id !== id));
        }
    };

    const openAddMoney = (goal) => {
        setActiveGoal(goal);
        setIsAddMoneyOpen(true);
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Savings Goals</h1>
                <Button onClick={openAdd}><Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Goal</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
                {goals.map(goal => {
                    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const isComplete = percentage >= 100;

                    return (
                        <Card key={goal.id} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{goal.name}</h3>
                                    <div className="text-caption" style={{ color: 'var(--jm-dark-gray)', marginTop: '0.25rem' }}>
                                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => openEdit(goal)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--jm-dark-blue)' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '2rem', fontWeight: '700', color: isComplete ? '#4caf50' : 'var(--jm-black)' }}>
                                    ${goal.currentAmount.toLocaleString()}
                                </span>
                                <span style={{ color: 'var(--jm-dark-gray)' }}>
                                    / ${goal.targetAmount.toLocaleString()}
                                </span>
                            </div>

                            <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--jm-light-gray)', borderRadius: '6px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                                <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: isComplete ? '#4caf50' : 'var(--jm-dark-blue)', borderRadius: '6px', transition: 'width 0.3s ease' }}></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                <span style={{ color: isComplete ? '#4caf50' : 'var(--jm-dark-blue)', fontWeight: '600' }}>
                                    {percentage.toFixed(1)}% {isComplete ? 'Completed!' : ''}
                                </span>
                                <span style={{ color: 'var(--jm-dark-gray)' }}>
                                    ${(Math.max(goal.targetAmount - goal.currentAmount, 0)).toLocaleString()} left
                                </span>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--jm-light-gray)' }}>
                                <Button
                                    variant="secondary"
                                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    onClick={() => openAddMoney(goal)}
                                    disabled={isComplete}
                                >
                                    <TrendingUp size={16} /> Add Money
                                </Button>
                            </div>
                        </Card>
                    );
                })}

                {goals.length === 0 && (
                    <Card style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: 'var(--jm-dark-gray)' }}>
                        <div style={{ marginBottom: '1rem' }}>No savings goals created yet.</div>
                        <Button variant="secondary" onClick={openAdd}>Create your first goal</Button>
                    </Card>
                )}
            </div>

            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={handleSaveGoal}
                initialData={editingGoal}
            />

            <AddMoneyModal
                isOpen={isAddMoneyOpen}
                onClose={() => setIsAddMoneyOpen(false)}
                onSave={handleAddMoney}
                goalName={activeGoal?.name}
            />
        </div>
    );
};

export default Goals;
