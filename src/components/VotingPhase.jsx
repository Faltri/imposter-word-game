import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Zap, HelpCircle } from 'lucide-react';

const VotingPhase = ({ players, onVoteComplete, allowDoubleDown = false }) => {
    const [phase, setPhase] = useState('discussion'); // 'discussion' | 'voting'
    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [votes, setVotes] = useState({}); // { voterId: { target: targetId, doubled: boolean } }
    const [isDoubleDown, setIsDoubleDown] = useState(false);

    const startVoting = () => {
        setPhase('voting');
        setCurrentVoterIndex(0);
        setIsDoubleDown(false);
    };

    const handleVote = (targetId, forcedDoubled = null) => {
        const voter = players[currentVoterIndex];
        const doubled = forcedDoubled !== null ? forcedDoubled : isDoubleDown;

        const newVotes = { ...votes, [voter.id]: { target: targetId, doubled } };
        setVotes(newVotes);

        if (currentVoterIndex < players.length - 1) {
            setCurrentVoterIndex(prev => prev + 1);
            setIsDoubleDown(false);
        } else {
            // All votes cast
            setTimeout(() => {
                onVoteComplete(newVotes);
            }, 500);
        }
    };

    // AI Voting Logic simulation
    useEffect(() => {
        if (phase === 'voting') {
            const currentVoter = players[currentVoterIndex];
            if (currentVoter.isAI) {
                // AI votes randomly for now, avoiding self
                const candidates = players.filter(p => p.id !== currentVoter.id);
                const randomTarget = candidates[Math.floor(Math.random() * candidates.length)];

                // AI Double Down logic
                const shouldDouble = allowDoubleDown && Math.random() < 0.3;

                // Simulate think time
                setTimeout(() => {
                    handleVote(randomTarget.id, shouldDouble);
                }, 1500 + (shouldDouble ? 500 : 0));
            }
        }
    }, [phase, currentVoterIndex]);

    const currentVoter = players[currentVoterIndex];

    return (
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatePresence mode="wait">
                {phase === 'discussion' ? (
                    <motion.div
                        key="discussion"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-panel"
                        style={{ padding: '3rem', textAlign: 'center', width: '100%' }}
                    >
                        <HelpCircle size={48} color="var(--primary-gold)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Discuss! Who is the Imposter?</h3>

                        <button className="btn-primary" onClick={startVoting}>
                            Vote Now
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="voting"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel"
                        style={{ padding: '2rem', width: '100%' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Voting Phase</h2>
                            {currentVoter.isAI ? (
                                <h3 className="animate-pulse" style={{ fontSize: '1.5rem', color: 'var(--accent-purple)' }}>
                                    AI {currentVoter.name} is choosing...
                                </h3>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem' }}>
                                        <span style={{ color: 'var(--primary-gold)' }}>{currentVoter.name}</span>, who is the Imposter?
                                    </h3>

                                    {allowDoubleDown && (
                                        <label style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.5rem 1rem', borderRadius: '12px',
                                            background: isDoubleDown ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                                            border: isDoubleDown ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
                                            cursor: 'pointer', transition: 'all 0.2s', marginTop: '0.5rem'
                                        }}>
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '4px',
                                                border: '2px solid var(--primary-gold)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: isDoubleDown ? 'var(--primary-gold)' : 'transparent'
                                            }}>
                                                {isDoubleDown && <Zap size={14} color="black" fill="black" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={isDoubleDown}
                                                onChange={(e) => setIsDoubleDown(e.target.checked)}
                                                style={{ display: 'none' }}
                                            />
                                            <span style={{ fontWeight: 500, color: isDoubleDown ? 'var(--primary-gold)' : 'var(--text-secondary)' }}>
                                                Double Down <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(x2 Pts / -1 if wrong)</span>
                                            </span>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                        {!currentVoter.isAI && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                {players.map(p => (
                                    <button
                                        key={p.id}
                                        disabled={p.id === currentVoter.id}
                                        onClick={() => handleVote(p.id)}
                                        className="btn-ghost"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '1.5rem',
                                            opacity: p.id === currentVoter.id ? 0.3 : 1,
                                            cursor: p.id === currentVoter.id ? 'not-allowed' : 'pointer',
                                            border: isDoubleDown ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
                                            boxShadow: isDoubleDown ? '0 0 15px rgba(255, 215, 0, 0.1)' : 'none',
                                            height: '140px',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '0.5rem',
                                            position: 'relative'
                                        }}>
                                            <span style={{ fontSize: '1.4rem' }}>{p.name[0]}</span>
                                            {votes[p.id] && <UserCheck size={20} style={{ position: 'absolute', bottom: -5, right: -5, color: '#10B981' }} />}
                                        </div>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VotingPhase;
