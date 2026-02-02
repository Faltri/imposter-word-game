import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck } from 'lucide-react'; // Removed Clock

const VotingPhase = ({ players, onVoteComplete }) => {
    const [phase, setPhase] = useState('discussion'); // 'discussion' | 'voting'
    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [votes, setVotes] = useState({}); // { voterId: targetId }

    const startVoting = () => {
        setPhase('voting');
        setCurrentVoterIndex(0);
    };

    const handleVote = (targetId) => {
        const voter = players[currentVoterIndex];
        setVotes(prev => ({ ...prev, [voter.id]: targetId }));

        if (currentVoterIndex < players.length - 1) {
            setCurrentVoterIndex(prev => prev + 1);
        } else {
            // All votes cast
            // Small delay then submit
            setTimeout(() => {
                onVoteComplete({ ...votes, [voter.id]: targetId });
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

                // Simulate think time
                setTimeout(() => {
                    handleVote(randomTarget.id);
                }, 1500);
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
                        {/* ... existing voting UI ... */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Voting Phase</h2>
                            {currentVoter.isAI ? (
                                <h3 className="animate-pulse" style={{ fontSize: '1.5rem', color: 'var(--accent-purple)' }}>
                                    AI {currentVoter.name} is choosing...
                                </h3>
                            ) : (
                                <h3 style={{ fontSize: '1.5rem' }}>
                                    <span style={{ color: 'var(--primary-gold)' }}>{currentVoter.name}</span>, who is the Imposter?
                                </h3>
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
                                            border: '1px solid var(--glass-border)',
                                            height: '120px',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <span style={{ fontSize: '1.2rem' }}>{p.name[0]}</span>
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
