import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Lock } from 'lucide-react';

const PlayerTransition = ({ playerName, onReady }) => {
    return (
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Lock size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
                <h2 style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>Pass device to</h2>
                <h1 className="text-gradient-gold" style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{playerName}</h1>
            </div>

            <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Ensure no one else is looking at the screen.
                </p>
            </div>

            <button className="btn-primary" onClick={onReady} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Eye size={20} />
                I am {playerName}
            </button>
        </div>
    );
};

export default PlayerTransition;
