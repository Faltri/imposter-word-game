import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Clock, Layers, Users, RefreshCw, Sparkles, X, Loader2, Shield,
    ArrowLeft, ChevronRight, EyeOff, Zap, Brain, Globe, Palette
} from 'lucide-react';
import categoriesData from '../data/categories.json';
import { generateCategory } from '../utils/aiService';

const GameRules = ({ onStart, onBack, initialValues, playerCount = 0 }) => {
    // Consolidated State
    const [localRules, setLocalRules] = useState({
        clueRounds: initialValues?.clueRounds || 1,
        timerEnabled: initialValues?.timerEnabled ?? true,
        timerDuration: initialValues?.timerDuration || 60,
        fairPlayEnabled: initialValues?.fairPlayEnabled ?? true,
        selectedCategories: initialValues?.selectedCategories || categoriesData.categories.map(c => c.id),
        privacyMasking: initialValues?.privacyMasking || false,
        hardMode: initialValues?.hardMode || false,
        aiDifficulty: initialValues?.aiDifficulty || 'medium',
        doubleAgent: initialValues?.doubleAgent || false,
        theme: initialValues?.theme || 'classic',
        language: initialValues?.language || 'en',
        pointMultiplier: initialValues?.pointMultiplier || false
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false);
    const [customTheme, setCustomTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const updateRule = (key, value) => {
        setLocalRules(prev => ({ ...prev, [key]: value }));
    };

    const toggleCategory = (id) => {
        setLocalRules(prev => ({
            ...prev,
            selectedCategories: prev.selectedCategories.includes(id)
                ? prev.selectedCategories.filter(c => c !== id)
                : [...prev.selectedCategories, id]
        }));
    };

    const handleStart = () => {
        if (localRules.selectedCategories.length === 0) return;
        onStart(localRules);
    };

    const handleBack = () => {
        if (showAdvanced) {
            setShowAdvanced(false);
        } else if (onBack) {
            onBack();
        }
    };

    const handleAIGenerate = async (themeToUse) => {
        const theme = themeToUse || customTheme;
        if (!theme.trim()) return;

        setIsGenerating(true);
        try {
            const customCategory = await generateCategory(theme, localRules.language);
            onStart({
                ...localRules,
                selectedCategories: [],
                customCategory
            });
        } catch (error) {
            console.error("Generation failed", error);
            setIsGenerating(false);
        }
    };

    // Render Helpers
    const Toggle = ({ label, subLabel, icon: Icon, value, onChange, disabled }) => (
        <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px',
            opacity: disabled ? 0.5 : 1
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {Icon && <Icon size={20} color="var(--primary-gold)" />}
                <div>
                    <span style={{ display: 'block', fontWeight: 500 }}>{label}</span>
                    {subLabel && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subLabel}</span>}
                </div>
            </div>
            <div
                style={{
                    width: '50px', height: '28px',
                    background: value ? 'var(--primary-gold)' : 'rgba(255,255,255,0.1)',
                    borderRadius: '20px', position: 'relative', transition: 'background 0.3s'
                }}
                onClick={(e) => {
                    e.preventDefault();
                    if (!disabled) onChange(!value);
                }}
            >
                <div style={{
                    width: '24px', height: '24px',
                    background: 'white', borderRadius: '50%',
                    position: 'absolute', top: '2px',
                    left: value ? '24px' : '2px', transition: 'left 0.3s'
                }} />
            </div>
        </label>
    );

    if (showAdvanced) {
        return (
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <button onClick={handleBack} className="btn-ghost" style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '50%' }}>
                        <ArrowLeft size={24} color="var(--primary-gold)" />
                    </button>
                    <h2 className="text-gradient-gold" style={{ fontSize: '1.8rem', margin: 0 }}>Advanced Settings</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Privacy Masking */}
                    <Toggle
                        label="Privacy Masking"
                        subLabel="Blur Secret Word until revealed"
                        icon={EyeOff}
                        value={localRules.privacyMasking}
                        onChange={(v) => updateRule('privacyMasking', v)}
                    />

                    {/* Hard Mode */}
                    <Toggle
                        label="Hard Mode"
                        subLabel="High Stakes 4-word grid"
                        icon={Zap}
                        value={localRules.hardMode}
                        onChange={(v) => updateRule('hardMode', v)}
                    />

                    {/* Point Multiplier */}
                    <Toggle
                        label="Point Multiplier"
                        subLabel="Allow Double Down betting"
                        icon={Users}
                        value={localRules.pointMultiplier}
                        onChange={(v) => updateRule('pointMultiplier', v)}
                    />

                    {/* AI Intelligence */}
                    <section style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Brain size={20} color="var(--primary-gold)" />
                            <span style={{ fontWeight: 500 }}>AI Intelligence</span>
                        </div>
                        <input
                            type="range" min="0" max="2" step="1"
                            value={localRules.aiDifficulty === 'easy' ? 0 : localRules.aiDifficulty === 'medium' ? 1 : 2}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                updateRule('aiDifficulty', val === 0 ? 'easy' : val === 1 ? 'medium' : 'hard');
                            }}
                            style={{ width: '100%', accentColor: 'var(--primary-gold)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            <span>Easy</span><span>Medium</span><span>Hard</span>
                        </div>
                    </section>

                    {/* Double Agent */}
                    <Toggle
                        label="Double Agent"
                        subLabel="2 Imposters (Req. 6+ Players)"
                        icon={Users}
                        value={localRules.doubleAgent}
                        onChange={(v) => updateRule('doubleAgent', v)}
                        disabled={playerCount < 6}
                    />

                    {/* Theme & Language */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Palette size={18} color="var(--primary-gold)" />
                                <span style={{ fontSize: '0.9rem' }}>Theme</span>
                            </div>
                            <select
                                value={localRules.theme}
                                onChange={(e) => updateRule('theme', e.target.value)}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px' }}
                            >
                                <option value="classic">Classic</option>
                                <option value="neon">Neon</option>
                                <option value="minimal">Minimal</option>
                            </select>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Globe size={18} color="var(--primary-gold)" />
                                <span style={{ fontSize: '0.9rem' }}>Language</span>
                            </div>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => updateRule('language', 'en')}
                                    style={{ flex: 1, padding: '0.5rem', background: localRules.language === 'en' ? 'var(--primary-gold)' : 'transparent', color: localRules.language === 'en' ? 'black' : 'white', border: 'none' }}
                                >EN</button>
                                <button
                                    onClick={() => updateRule('language', 'jp')}
                                    style={{ flex: 1, padding: '0.5rem', background: localRules.language === 'jp' ? 'var(--primary-gold)' : 'transparent', color: localRules.language === 'jp' ? 'black' : 'white', border: 'none' }}
                                >JP</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                {onBack && (
                    <button onClick={handleBack} className="btn-ghost" style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '50%' }}>
                        <ArrowLeft size={24} color="var(--primary-gold)" />
                    </button>
                )}
                <h2 className="text-gradient-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2rem', margin: 0 }}>
                    <Settings /> Game Rules
                </h2>
            </div>

            {/* General Settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <section>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Layers size={20} color="var(--primary-gold)" /> Clue Rounds
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {[1, 2, 3].map(model => (
                            <button key={model} onClick={() => updateRule('clueRounds', model)}
                                className={localRules.clueRounds === model ? 'btn-primary' : 'btn-ghost'}
                                style={{ flex: 1, padding: '0.75rem' }}
                            >
                                {model} Round{model > 1 ? 's' : ''}
                            </button>
                        ))}
                    </div>
                </section>

                <Toggle
                    label="Discussion Timer"
                    icon={Clock}
                    value={localRules.timerEnabled}
                    onChange={(v) => updateRule('timerEnabled', v)}
                />

                {localRules.timerEnabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '1rem' }}>
                        <input type="range" min="30" max="300" step="30"
                            value={localRules.timerDuration}
                            onChange={(e) => updateRule('timerDuration', Number(e.target.value))}
                            style={{ flex: 1, accentColor: 'var(--primary-gold)' }}
                        />
                        <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 700 }}>{localRules.timerDuration}s</span>
                    </div>
                )}

                <Toggle
                    label="Fair Play Mode"
                    subLabel="Imposter never starts first"
                    icon={Shield}
                    value={localRules.fairPlayEnabled}
                    onChange={(v) => updateRule('fairPlayEnabled', v)}
                />

                <button
                    onClick={() => setShowAdvanced(true)}
                    className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', width: '100%', marginTop: '0.5rem' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Settings size={20} color="var(--text-secondary)" /> Advanced Settings
                    </span>
                    <ChevronRight size={20} color="var(--text-secondary)" />
                </button>
            </div>

            {/* Categories */}
            <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><RefreshCw size={20} color="var(--primary-gold)" /> Categories</h3>
                    <button className="btn-ghost" onClick={() => setShowAIModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}>
                        <Sparkles size={16} /> Custom AI Genre
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                    {categoriesData.categories.map(cat => (
                        <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                            style={{
                                padding: '0.5rem', fontSize: '0.9rem', borderRadius: '8px',
                                border: localRules.selectedCategories.includes(cat.id) ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
                                background: localRules.selectedCategories.includes(cat.id) ? 'rgba(255, 215, 0, 0.15)' : 'transparent',
                                color: localRules.selectedCategories.includes(cat.id) ? 'var(--primary-gold)' : 'var(--text-secondary)',
                                cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}
                        >{cat.name}</button>
                    ))}
                </div>
            </section>

            <button className="btn-primary" onClick={handleStart} disabled={localRules.selectedCategories.length === 0} style={{ width: '100%', opacity: localRules.selectedCategories.length === 0 ? 0.5 : 1 }}>
                START
            </button>

            {/* AI Overlay (Copied from previous implementation, kept simple) */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
                            <button onClick={() => !isGenerating && setShowAIModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <Sparkles size={48} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
                                <h2 className="text-gradient-gold" style={{ fontSize: '1.8rem' }}>Create Custom Theme</h2>
                                <input type="text" value={customTheme} onChange={(e) => setCustomTheme(e.target.value)} placeholder="Enter a theme..." style={{ width: '100%', padding: '1rem', marginTop: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }} onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()} />
                                <button className="btn-primary" onClick={() => handleAIGenerate()} style={{ width: '100%', marginTop: '1rem' }} disabled={!customTheme.trim() || isGenerating}>
                                    {isGenerating ? <Loader2 className="spin" /> : 'Generate'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GameRules;

