import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, AlertCircle } from 'lucide-react';

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
            const color = outcome === 'imposter_win' ? '#D946EF' : '#FFD700';
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [color, '#ffffff']
            });
        }
    }, [mode, outcome]);

    if (mode === 'guess') {
        return (
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <AlertCircle size={48} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Caught!</h2>
                    <p style={{ fontSize: '1.2rem' }}>
                        <span style={{ color: 'var(--accent-purple)', fontWeight: 700 }}>{imposter.name}</span> was the Imposter!
                    </p>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                        But they have one chance to escape...
                    </p>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--primary-gold)' }}>
                        Guess the Secret Word!
                    </h3>
                </div>

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
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ marginBottom: '2rem' }}
            >
                <Trophy size={80} color={outcome === 'imposter_win' ? 'var(--accent-purple)' : 'var(--primary-gold)'} />
            </motion.div>

            <h1 className="text-gradient-gold" style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '1rem' }}>
                {outcome === 'imposter_win' ? 'IMPOSTER WINS' : 'CIVILIANS WIN'}
            </h1>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>THE IMPOSTER WAS</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '1.5rem' }}>{imposter.name}</p>

                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }} />

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>THE SECRET WORD WAS</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-gold)' }}>{secretWord}</p>
            </div>

            <button className="btn-primary" onClick={onPlayAgain} style={{ width: '100%' }}>
                Play Again
            </button>
        </div>
    );
};

export default Resolution;
