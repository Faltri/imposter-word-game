import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, AlertCircle } from 'lucide-react';
import { playSound } from '../utils/audioManager';

const Resolution = ({
    mode, // 'guess' | 'reveal'
    imposter,
    outcome, // 'imposter_win' | 'civilian_win'
    secretWord,
    categoryWords,
    onImposterGuess,
    onPlayAgain
}) => {

    useEffect(() => {
        if (mode === 'reveal') {
            playSound('fanfare');
            const color = outcome === 'imposter_win' ? '#D946EF' : '#FFD700';
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [color, '#ffffff']
            });
        } else if (mode === 'guess') {
            // "Caught!" moment
            playSound('fail');
        }
    }, [mode, outcome]);

    return (
        <AnimatePresence mode="wait">
            {mode === 'guess' && (
                <motion.div
                    key="guess"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-panel"
                    style={{ padding: '2rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ x: [-10, 10, -10, 10, 0] }}
                        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                        style={{ marginBottom: '2rem' }}
                    >
                        <AlertCircle size={48} color="var(--accent-purple)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                        <h2 className="text-gradient-gold" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Caught!</h2>
                        <p style={{ fontSize: '1.2rem' }}>
                            <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{imposter.name}</span> was the Imposter!
                        </p>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            But they have one chance to escape...
                        </p>
                        <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--primary-gold)' }}>
                            Guess the Secret Word!
                        </h3>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                        {categoryWords.map(word => (
                            <button
                                key={word}
                                onClick={() => onImposterGuess(word)}
                                className="btn-ghost"
                                style={{ padding: '1rem', fontSize: '1rem', fontWeight: 500 }}
                            >
                                {word}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {mode === 'reveal' && (
                <motion.div
                    key="reveal"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-panel"
                    style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.6, ease: "backOut" }}
                        style={{ marginBottom: '2rem' }}
                    >
                        <Trophy size={80} color={outcome === 'imposter_win' ? 'var(--accent-purple)' : 'var(--primary-gold)'} />
                    </motion.div>

                    <h1 className="text-gradient-gold" style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                        {outcome === 'imposter_win' ? 'IMPOSTER WINS' : 'CIVILIANS WIN'}
                    </h1>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>THE IMPOSTER WAS</p>
                        <motion.p
                            animate={{
                                scale: [1, 1.1, 1],
                                textShadow: outcome === 'imposter_win'
                                    ? ["0 0 0px #D946EF", "0 0 20px #D946EF", "0 0 0px #D946EF"]
                                    : "none"
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '1.5rem' }}
                        >
                            {imposter.name}
                        </motion.p>

                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>THE SECRET WORD WAS</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-gold)' }}>{secretWord}</p>
                    </div>

                    <button className="btn-primary" onClick={onPlayAgain} style={{ width: '100%' }}>
                        Play Again
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Resolution;
