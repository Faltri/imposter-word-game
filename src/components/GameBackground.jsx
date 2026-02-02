import React from 'react';
import { motion } from 'framer-motion';

const GameBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none',
            background: 'var(--bg-dark)'
        }}>
            {/* Deep Gradient Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, #0f0a15 100%)',
                opacity: 0.9
            }} />

            {/* Animated Orbs */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '50vw',
                    height: '50vw',
                    borderRadius: '50%',
                    background: 'rgba(46, 26, 71, 0.4)',
                    filter: 'blur(100px)'
                }}
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '60vw',
                    height: '60vw',
                    borderRadius: '50%',
                    background: 'rgba(30, 27, 75, 0.4)',
                    filter: 'blur(120px)'
                }}
                animate={{
                    x: [0, -40, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    top: '30%',
                    left: '40%',
                    width: '30vw',
                    height: '30vw',
                    borderRadius: '50%',
                    background: 'rgba(255, 215, 0, 0.05)',
                    filter: 'blur(80px)'
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.3, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Texture Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
                opacity: 0.05,
                mixBlendMode: 'overlay'
            }} />
        </div>
    );
};

export default GameBackground;
