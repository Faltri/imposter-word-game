import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium Switch Toggle
 * A beautiful, animated switch component with smooth transitions
 */
export const SwitchToggle = ({
    value,
    onChange,
    label,
    sublabel,
    icon: Icon,
    disabled = false,
    confirmGlow = false // For save confirmation effect
}) => {
    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                padding: '0.75rem 0',
                transition: 'all 0.3s'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {Icon && <Icon size={20} color={value ? 'var(--primary-gold)' : 'var(--text-secondary)'} style={{ transition: 'color 0.3s' }} />}
                <div>
                    <span style={{ display: 'block', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                    {sublabel && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sublabel}</span>}
                </div>
            </div>

            <motion.div
                onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) onChange(!value);
                }}
                animate={{
                    background: value ? 'var(--primary-gold)' : '#2a2a35',
                    boxShadow: confirmGlow
                        ? '0 0 15px rgba(16, 185, 129, 0.8)'
                        : value
                            ? '0 0 12px rgba(255, 215, 0, 0.3)'
                            : 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{
                    width: '52px',
                    height: '28px',
                    borderRadius: '14px',
                    position: 'relative',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <motion.div
                    animate={{
                        x: value ? 24 : 2,
                        scale: 1
                    }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '2px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                />
            </motion.div>
        </label>
    );
};

/**
 * Premium Slider
 * A high-fidelity slider with smooth animations and scale effect
 */
export const PremiumSlider = ({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    valueDisplay,
    unit = '',
    disabled = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef(null);

    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div style={{ opacity: disabled ? 0.5 : 1 }}>
            {label && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
                    <span style={{ color: 'var(--primary-gold)', fontWeight: 700 }}>
                        {valueDisplay !== undefined ? valueDisplay : value}{unit}
                    </span>
                </div>
            )}

            <div
                ref={trackRef}
                style={{
                    position: 'relative',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
            >
                {/* Filled Track */}
                <motion.div
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                        position: 'absolute',
                        height: '100%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, var(--primary-gold-dim), var(--primary-gold))',
                        boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
                    }}
                />

                {/* Thumb */}
                <motion.div
                    animate={{
                        left: `calc(${percentage}% - 12px)`,
                        scale: isDragging ? 1.15 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                        position: 'absolute',
                        top: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--primary-gold)',
                        boxShadow: isDragging
                            ? '0 0 20px rgba(255, 215, 0, 0.6)'
                            : '0 2px 8px rgba(0,0,0,0.4)',
                        cursor: disabled ? 'not-allowed' : 'grab',
                        border: '3px solid white'
                    }}
                />

                {/* Invisible Input for Accessibility */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    disabled={disabled}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        top: '-8px',
                        height: '24px'
                    }}
                />
            </div>
        </div>
    );
};

/**
 * Accordion Container
 * For collapsible sections with smooth animation
 */
export const Accordion = ({ isOpen, children }) => {
    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                >
                    <div style={{ paddingTop: '1rem' }}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/**
 * Ripple Button
 * A button with material-design style ripple effect
 */
export const RippleButton = ({
    onClick,
    children,
    className = 'btn-primary',
    style = {},
    disabled = false
}) => {
    const [ripples, setRipples] = useState([]);
    const buttonRef = useRef(null);

    const handleClick = (e) => {
        if (disabled) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            x,
            y,
            id: Date.now()
        };

        setRipples(prev => [...prev, newRipple]);

        // Clean up ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);

        onClick && onClick(e);
    };

    return (
        <button
            ref={buttonRef}
            className={className}
            onClick={handleClick}
            disabled={disabled}
            style={{
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            {children}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        left: ripple.x,
                        top: ripple.y,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.4)',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                    }}
                />
            ))}
        </button>
    );
};
