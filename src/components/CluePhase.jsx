import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Clock } from 'lucide-react';
import { playSound } from '../utils/audioManager';

const CluePhase = ({ currentPlayer, clues, onSubmitClue, initialTime = 60, showTimer = true, onTimeExpired, t }) => {
    const [clue, setClue] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const scrollRef = useRef(null);

    // Timer Logic
    useEffect(() => {
        if (!showTimer) return;

        // Sound Trigger for final 10 seconds
        if (timeLeft <= 10 && timeLeft > 0) {
            playSound('tick');
        }

        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else {
            // Timer Hit Zero
            onTimeExpired();
        }
    }, [timeLeft, showTimer, onTimeExpired]);

    // Auto-scroll to bottom of clues
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [clues]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!clue.trim()) return;

        // Simple validation: one word-ish
        if (clue.trim().split(' ').length > 3) {
            setError(t?.clueError || 'Keep it short (1-3 words max)');
            return;
        }

        onSubmitClue(clue.trim());
        setClue('');
        setError('');
    };

    const isAI = currentPlayer?.isAI;

    return (
        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', height: '70vh' }}>
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={20} color="var(--primary-gold)" />
                        {t?.clueHistory || "Clue History"}
                    </h2>
                    {showTimer && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft <= 10 ? '#ef4444' : 'white', fontWeight: 'bold' }}>
                            <Clock size={18} className={timeLeft <= 10 ? 'animate-pulse' : ''} />
                            <span>{timeLeft}s</span>
                        </div>
                    )}
                </div>

                <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {clues.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                            {t?.noClues || "No clues yet. Start the round!"}
                        </div>
                    ) : (
                        clues.map((c, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    alignSelf: 'flex-start',
                                    maxWidth: '80%',
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '8px' }}>
                                    {c.playerName}
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '16px',
                                    borderTopLeftRadius: '16px',
                                    borderBottomLeftRadius: c.playerId === currentPlayer.id ? '16px' : '4px',
                                    borderBottomRightRadius: c.playerId === currentPlayer.id ? '4px' : '16px',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    {c.text}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {isAI ? (
                    <div style={{ textAlign: 'center', color: 'var(--accent-purple)', padding: '1rem' }}>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            {t?.aiIsThinking ? t.aiIsThinking.replace('{name}', currentPlayer.name) : `${currentPlayer.name} is thinking...`}
                        </motion.div>
                    </div>
                ) : (
                    <>
                        <h3 style={{ marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--primary-gold)' }}>{currentPlayer.name}</span>'s Turn
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="text"
                                    value={clue}
                                    onChange={(e) => setClue(e.target.value)}
                                    placeholder={t?.clueInputPlaceholder || "Type your clue..."}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: error ? '1px solid #ef4444' : '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    autoFocus
                                />
                                {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', marginLeft: '0.5rem' }}>{error}</p>}
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={!clue.trim()}
                                style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Send size={24} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CluePhase;
