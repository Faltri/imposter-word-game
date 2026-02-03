import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, ArrowRight } from 'lucide-react';

const PrivacyWord = ({ word, enabled, t }) => {
    const [isHeld, setIsHeld] = useState(false);

    if (!enabled) return (
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-gold)' }}>
            {word}
        </p>
    );

    return (
        <div
            onPointerDown={() => setIsHeld(true)}
            onPointerUp={() => setIsHeld(false)}
            onPointerLeave={() => setIsHeld(false)}
            onTouchStart={() => setIsHeld(true)}
            onTouchEnd={() => setIsHeld(false)}
            style={{
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                userSelect: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <p style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--primary-gold)',
                filter: isHeld ? 'none' : 'blur(10px)',
                transition: 'filter 0.2s',
                background: isHeld ? 'transparent' : 'rgba(255,255,255,0.1)',
                padding: isHeld ? 0 : '0.25rem 1rem',
                borderRadius: '4px'
            }}>
                {word}
            </p>
            {!isHeld && <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}><EyeOff size={12} /> {t?.holdToReveal || "Hold to reveal"}</div>}
        </div>
    );
};

const RoleReveal = ({ playerName, role, category, secretWord, onNext, isLast, isFirstPlayer, onReroll, privacyEnabled, t }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = () => {
        if (!isRevealed) {
            if (navigator.vibrate) navigator.vibrate(50);
            setIsRevealed(true);
        } else {
            setIsRevealed(false);
        }
    };

    const handleNext = () => {
        // Clear state for next person
        setIsRevealed(false);
        onNext();
    }

    return (
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center', perspective: '1000px' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                {t?.passDevice || "Pass device to"} <span style={{ color: 'var(--primary-gold)' }}>{playerName}</span>
            </h2>

            <div style={{ position: 'relative', height: '500px', cursor: 'pointer' }} onClick={!isRevealed ? handleReveal : undefined}>
                <motion.div
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Front of Card (Hidden) */}
                    <div className="glass-panel" style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))',
                        border: '1px solid var(--primary-gold)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>CONFIDENTIAL</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>{t?.tapToReveal || "Tap to reveal your identity"}</p>
                    </div>

                    {/* Back of Card (Revealed) */}
                    <div className="glass-panel" style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: role === 'imposter' ?
                            'linear-gradient(135deg, #4a192c 0%, #2E1A47 100%)' :
                            'linear-gradient(135deg, #1a2e4a 0%, #2E1A47 100%)',
                        border: `2px solid ${role === 'imposter' ? 'var(--accent-purple)' : 'var(--accent-blue)'}`,
                        cursor: 'default'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            {role === 'imposter' ? '🦎' : '🕵️'}
                        </div>

                        <h3 style={{
                            fontSize: '2rem',
                            fontWeight: 800,
                            marginBottom: '2rem',
                            color: role === 'imposter' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                            textTransform: 'uppercase'
                        }}>
                            {role === 'imposter' ? (t?.imposterRole || 'The Imposter') : (t?.civilianRole || 'Civilian')}
                        </h3>

                        <div style={{ width: '80%', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t?.category || "CATEGORY"}</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>{category}</p>

                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />

                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t?.secretWord || "SECRET WORD"}</p>
                            {role === 'imposter' ? (
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)', letterSpacing: '1px' }}>
                                    UNKNOWN
                                </p>
                            ) : (
                                <PrivacyWord word={secretWord} enabled={privacyEnabled} t={t} />
                            )}
                        </div>

                        {role === 'imposter' && (
                            <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                {t?.imposterHint || "Blend in. Don't get caught."}
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isRevealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <button
                            className="btn-primary"
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            style={{ width: '100%' }}
                        >
                            {isLast ? (t?.start || "Start Game") : (t?.nextPlayer || "Next Player")} <ArrowRight size={20} style={{ marginLeft: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }} />
                        </button>

                        {isFirstPlayer && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onReroll(); }}
                                className="btn-ghost"
                                style={{
                                    width: '100%',
                                    color: '#ef4444',
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {t?.reroll || "Emergency Reroll"}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleReveal;
