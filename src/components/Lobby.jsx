import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Cpu, X, Play, Plus } from 'lucide-react';

const Lobby = ({ players, onAddPlayer, onRemovePlayer, onStartGame }) => {
    const [name, setName] = useState('');
    const [isAI, setIsAI] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAddPlayer(name, isAI);
        setName('');
        setIsAI(false);
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 className="text-gradient-gold" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Word Imposter</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Gather your friends or play with AI</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter player name..."
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            padding: '1rem',
                            paddingLeft: '3rem',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary-gold)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '24px',
                                background: isAI ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                position: 'relative',
                                transition: 'background 0.3s'
                            }}
                            onClick={() => setIsAI(!isAI)}
                        >
                            <div style={{
                                width: '18px',
                                height: '18px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: isAI ? '19px' : '3px',
                                transition: 'left 0.3s'
                            }} />
                        </div>
                        <span>Add as AI Player</span>
                    </label>

                    <button
                        type="submit"
                        className="btn-ghost"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                        disabled={!name.trim()}
                    >
                        <Plus size={18} />
                        <span>Add</span>
                    </button>
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                <AnimatePresence>
                    {players.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem 1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {p.isAI ?
                                    <Cpu size={20} color="var(--accent-purple)" /> :
                                    <User size={20} color="var(--primary-gold)" />
                                }
                                <span style={{ fontWeight: 500 }}>{p.name}</span>
                                {p.isAI && <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', background: 'rgba(217, 70, 239, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>AI</span>}
                            </div>
                            <button
                                onClick={() => onRemovePlayer(p.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {players.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        No players added yet via lobby.
                    </div>
                )}
            </div>

            <button
                className="btn-primary animate-glow"
                onClick={onStartGame}
                disabled={players.length < 3}
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: players.length < 3 ? 0.5 : 1,
                    cursor: players.length < 3 ? 'not-allowed' : 'pointer'
                }}
            >
                <Play size={20} fill="currentColor" />
                START GAME
            </button>
        </div>
    );
};

export default Lobby;
