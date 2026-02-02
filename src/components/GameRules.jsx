import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Clock, Layers, Users, RefreshCw, Sparkles, X, Loader2, Shield, ArrowLeft } from 'lucide-react';
import categoriesData from '../data/categories.json';
import { generateCategory } from '../utils/aiService';

const GameRules = ({ onStart, onBack }) => {
    const [clueRounds, setClueRounds] = useState(1);
    const [timerEnabled, setTimerEnabled] = useState(true);
    const [timerDuration, setTimerDuration] = useState(60);
    const [fairPlayEnabled, setFairPlayEnabled] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState(
        categoriesData.categories.map(c => c.id) // Default all selected
    );

    // AI State
    const [showAIModal, setShowAIModal] = useState(false);
    const [customTheme, setCustomTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleStart = () => {
        if (selectedCategories.length === 0) return;
        onStart({
            clueRounds,
            timerEnabled,
            timerDuration,
            fairPlayEnabled,
            selectedCategories
        });
    };

    const handleAIGenerate = async (themeToUse) => {
        const theme = themeToUse || customTheme;
        if (!theme.trim()) return;

        setIsGenerating(true);

        try {
            const customCategory = await generateCategory(theme);

            // Start game immediately with this custom category
            onStart({
                clueRounds,
                timerEnabled,
                timerDuration,
                fairPlayEnabled,
                selectedCategories: [], // Ignored when customCategory is present
                customCategory
            });
        } catch (error) {
            console.error("Generation failed", error);
            setIsGenerating(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="btn-ghost"
                        style={{
                            marginRight: '0.5rem',
                            padding: '0',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px'
                        }}
                    >
                        <ArrowLeft size={24} color="var(--primary-gold)" />
                    </button>
                )}
                <h2 className="text-gradient-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2rem', margin: 0 }}>
                    <Settings /> Game Rules
                </h2>
            </div>

            {/* Clue Rounds */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={20} color="var(--primary-gold)" />
                    Clue Rounds
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {[1, 2, 3].map(model => (
                        <button
                            key={model}
                            onClick={() => setClueRounds(model)}
                            className={clueRounds === model ? 'btn-primary' : 'btn-ghost'}
                            style={{ flex: 1, padding: '0.75rem' }}
                        >
                            {model} Round{model > 1 ? 's' : ''}
                        </button>
                    ))}
                </div>
            </section>

            {/* Timer Settings */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} color="var(--primary-gold)" />
                    Discussion Timer
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                        <span>Enable Timer</span>
                        <div
                            style={{
                                width: '50px',
                                height: '28px',
                                background: timerEnabled ? 'var(--primary-gold)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                position: 'relative',
                                transition: 'background 0.3s'
                            }}
                            onClick={(e) => { e.preventDefault(); setTimerEnabled(!timerEnabled); }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: timerEnabled ? '24px' : '2px',
                                transition: 'left 0.3s'
                            }} />
                        </div>
                    </label>

                    {timerEnabled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <input
                                type="range"
                                min="30"
                                max="300"
                                step="30"
                                value={timerDuration}
                                onChange={(e) => setTimerDuration(Number(e.target.value))}
                                style={{ flex: 1, accentColor: 'var(--primary-gold)' }}
                            />
                            <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 700 }}>{timerDuration}s</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Advanced Options */}
            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={20} color="var(--primary-gold)" />
                    General Settings
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                        <div>
                            <span style={{ display: 'block' }}>Fair Play Mode</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Imposter never starts first</span>
                        </div>
                        <div
                            style={{
                                width: '50px',
                                height: '28px',
                                background: fairPlayEnabled ? 'var(--primary-gold)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                position: 'relative',
                                transition: 'background 0.3s'
                            }}
                            onClick={(e) => { e.preventDefault(); setFairPlayEnabled(!fairPlayEnabled); }}
                        >
                            <div style={{
                                width: '24px',
                                height: '24px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: fairPlayEnabled ? '24px' : '2px',
                                transition: 'left 0.3s'
                            }} />
                        </div>
                    </label>
                </div>
            </section>

            {/* Categories */}
            <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={20} color="var(--primary-gold)" />
                        Categories
                    </h3>
                    <button
                        className="btn-ghost"
                        onClick={() => setShowAIModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderColor: 'var(--accent-purple)',
                            color: 'var(--accent-purple)'
                        }}
                    >
                        <Sparkles size={16} />
                        Custom AI Genre
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                    {categoriesData.categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            style={{
                                padding: '0.5rem',
                                fontSize: '0.9rem',
                                borderRadius: '8px',
                                border: selectedCategories.includes(cat.id)
                                    ? '1px solid var(--primary-gold)'
                                    : '1px solid var(--glass-border)',
                                background: selectedCategories.includes(cat.id)
                                    ? 'rgba(255, 215, 0, 0.15)'
                                    : 'transparent',
                                color: selectedCategories.includes(cat.id) ? 'var(--primary-gold)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            <button
                className="btn-primary"
                onClick={handleStart}
                disabled={selectedCategories.length === 0}
                style={{ width: '100%', opacity: selectedCategories.length === 0 ? 0.5 : 1 }}
            >
                START
            </button>

            {/* AI Generation Modal */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 100,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel"
                            style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}
                        >
                            <button
                                onClick={() => !isGenerating && setShowAIModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <Sparkles size={48} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
                                <h2 className="text-gradient-gold" style={{ fontSize: '1.8rem' }}>Create Custom Theme</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>Enter any topic and AI will generate game words.</p>
                            </div>

                            {isGenerating ? (
                                <div style={{ padding: '2rem', textAlign: 'center' }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                        style={{ display: 'inline-block', marginBottom: '1rem' }}
                                    >
                                        <Loader2 size={48} color="var(--primary-gold)" />
                                    </motion.div>
                                    <h3 style={{ fontSize: '1.2rem', color: 'white' }}>Analyzing Theme...</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Crafting specific words for you</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                                        <input
                                            type="text"
                                            value={customTheme}
                                            onChange={(e) => setCustomTheme(e.target.value)}
                                            placeholder="e.g. 'Olympic Sports', 'Types of Pizza'"
                                            style={{
                                                flex: 1,
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px',
                                                padding: '1rem',
                                                color: 'white',
                                                outline: 'none'
                                            }}
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                                        />
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleAIGenerate()}
                                            disabled={!customTheme.trim()}
                                            style={{ minWidth: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Sparkles size={20} />
                                        </button>
                                    </div>

                                    <div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Quick Start Ideas
                                        </p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {[
                                                { label: "🌍 World Landmarks", val: "World Landmarks" },
                                                { label: "🍳 Kitchen Staples", val: "Kitchen Staples" },
                                                { label: "🎨 Common Hobbies", val: "Common Hobbies" },
                                                { label: "🦁 Animal Kingdom", val: "Animal Kingdom" }
                                            ].map(chip => (
                                                <button
                                                    key={chip.val}
                                                    className="btn-ghost"
                                                    onClick={() => handleAIGenerate(chip.val)}
                                                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '20px' }}
                                                >
                                                    {chip.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GameRules;

