import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Globe, Sliders, ChevronLeft, Play, Check, Clock, Layers, Sparkles, X, Loader2 } from 'lucide-react';
import categoriesData from '../data/categories.json';
import { generateCategory } from '../utils/aiService';
import { SwitchToggle, PremiumSlider, Accordion, RippleButton } from './ui/PremiumInputs';

const GameRules = ({ onStart, onBack, initialValues, playerCount = 0, t, onLanguageChange, onThemeChange }) => {
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
        pointMultiplier: initialValues?.pointMultiplier || false,
        localizedCategories: initialValues?.localizedCategories || false
    });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);
    const [confirmGlow, setConfirmGlow] = useState(false);

    // AI Modal State
    const [showAIModal, setShowAIModal] = useState(false);
    const [customTheme, setCustomTheme] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const updateRule = (key, value) => {
        setLocalRules(prev => ({ ...prev, [key]: value }));

        // Immediate sync for language and theme
        if (key === 'language' && onLanguageChange) {
            onLanguageChange(value);
        }
        if (key === 'theme' && onThemeChange) {
            onThemeChange(value);
        }
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
        if (localRules.selectedCategories.length === 0 && !localRules.customCategory) return;
        onStart(localRules);
    };

    const handleBack = () => {
        if (onBack) onBack();
    };

    const handleSaveAdvanced = () => {
        // Trigger confirmation effects
        setConfirmGlow(true);
        setShowSavedToast(true);

        setTimeout(() => {
            setConfirmGlow(false);
            setShowAdvanced(false);
        }, 600);

        setTimeout(() => setShowSavedToast(false), 2000);
    };

    // AI Generation Logic
    const handleAIGenerate = async () => {
        if (!customTheme.trim()) return;
        setIsGenerating(true);

        try {
            console.log("[AI] Starting generation for theme:", customTheme);
            const result = await generateCategory(customTheme, localRules.language);

            // Validation Log
            console.log("AI Words Generated:", result.words);
            console.log("AI Category Name:", result.name);

            if (result && result.words && result.words.length > 0) {
                setLocalRules(prev => ({
                    ...prev,
                    customCategory: result,
                    selectedCategories: [] // Clear standard categories to use custom
                }));
                setShowAIModal(false);
                setCustomTheme('');
            } else {
                throw new Error("Invalid AI response structure");
            }
        } catch (e) {
            console.error("[AI] Generation Error:", e);

            // Check if it's a rate limit error and extract retry time
            const errorStr = e.message || '';
            if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
                const retryMatch = errorStr.match(/retry in (\d+)/i);
                const seconds = retryMatch ? retryMatch[1] : '60';
                alert(`⏳ Rate limit reached! Please wait ${seconds} seconds and try again.`);
            } else {
                alert(t?.aiGenerationFailed || "AI Generation failed. Please try again.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>

            {/* Saved Toast */}
            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                            background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white',
                            padding: '0.75rem 1.5rem', borderRadius: '24px',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 100,
                            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                            fontWeight: 600
                        }}
                    >
                        <Check size={18} /> {t?.saved || "Settings Saved!"}
                    </motion.div>
                )}
            </AnimatePresence>

            {!showAdvanced ? (
                <>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <button onClick={handleBack} className="btn-ghost" style={{ padding: '0.5rem', marginRight: '1rem' }}>
                            <ChevronLeft size={24} />
                        </button>
                        <h2 style={{ fontSize: '2rem', flex: 1 }} className="text-gradient-gold">{t?.gameRules || "Game Rules"}</h2>
                    </div>

                    {/* General Settings - Unified Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>

                        {/* Clue Rounds Slider */}
                        <PremiumSlider
                            label={t?.clueRounds || "Clue Rounds"}
                            value={localRules.clueRounds}
                            onChange={(val) => updateRule('clueRounds', val)}
                            min={1}
                            max={5}
                            step={1}
                        />

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />

                        {/* Discussion Timer Toggle + Slider (No Separate Bubble) */}
                        <SwitchToggle
                            label={t?.discussionTimer || "Discussion Timer"}
                            sublabel={localRules.timerEnabled ? `${localRules.timerDuration}s` : t?.disabled || "Disabled"}
                            icon={Clock}
                            value={localRules.timerEnabled}
                            onChange={(val) => updateRule('timerEnabled', val)}
                        />

                        <Accordion isOpen={localRules.timerEnabled}>
                            <PremiumSlider
                                label={t?.timerDuration || "Duration"}
                                value={localRules.timerDuration}
                                onChange={(val) => updateRule('timerDuration', val)}
                                min={30}
                                max={300}
                                step={15}
                                unit="s"
                            />
                        </Accordion>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />

                        {/* Fair Play Mode */}
                        <SwitchToggle
                            label={t?.fairPlayMode || "Fair Play Mode"}
                            sublabel={t?.fairPlaySub || "Imposter never starts first"}
                            icon={Shield}
                            value={localRules.fairPlayEnabled}
                            onChange={(val) => updateRule('fairPlayEnabled', val)}
                        />

                        {/* Advanced Settings Button */}
                        <button
                            onClick={() => setShowAdvanced(true)}
                            className="btn-ghost"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', border: '1px dashed var(--glass-border)' }}
                        >
                            <Sliders size={18} /> {t?.advancedSettings || "Advanced Settings"}
                        </button>

                    </div>

                    {/* Category Selection */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}><Layers size={20} color="var(--primary-gold)" style={{ marginRight: '0.5rem' }} />{t?.category || "Categories"}</h3>
                            <button onClick={() => setShowAIModal(true)} style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Sparkles size={14} /> {t?.aiGenerate || "AI Generate"}
                            </button>
                        </div>

                        {/* Show Custom Category if exists */}
                        {localRules.customCategory && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '1rem',
                                    marginBottom: '1rem',
                                    borderRadius: '12px',
                                    border: '2px solid var(--accent-purple)',
                                    background: 'rgba(217, 70, 239, 0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ color: 'var(--accent-purple)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Sparkles size={16} /> {localRules.customCategory.name}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {localRules.customCategory.words?.length || 0} words generated
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setLocalRules(prev => ({ ...prev, customCategory: null, selectedCategories: categoriesData.categories.map(c => c.id) }))}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                            {categoriesData.categories.map(cat => (
                                <motion.button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        border: localRules.selectedCategories.includes(cat.id) ? '1px solid var(--primary-gold)' : '1px solid var(--glass-border)',
                                        background: localRules.selectedCategories.includes(cat.id) ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.03)',
                                        color: localRules.selectedCategories.includes(cat.id) ? 'var(--primary-gold)' : 'var(--text-secondary)',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        opacity: localRules.customCategory ? 0.5 : 1
                                    }}
                                    disabled={!!localRules.customCategory}
                                >
                                    {cat.name}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <RippleButton
                        onClick={handleStart}
                        disabled={localRules.selectedCategories.length === 0 && !localRules.customCategory}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Play size={20} fill="currentColor" /> {t?.start || "START"}
                    </RippleButton>
                </>
            ) : (
                <>
                    {/* Advanced Settings Sub-Menu */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                        <button onClick={() => setShowAdvanced(false)} className="btn-ghost" style={{ padding: '0.5rem', marginRight: '1rem' }}>
                            <ChevronLeft size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', flex: 1 }}>{t?.advancedSettings || "Advanced Settings"}</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Language - Immediate Effect */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-gold)', fontSize: '0.9rem', fontWeight: 600 }}>{t?.language || "Language"}</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['en', 'jp'].map(lang => (
                                    <motion.button
                                        key={lang}
                                        onClick={() => updateRule('language', lang)}
                                        whileTap={{ scale: 0.95 }}
                                        animate={{
                                            borderColor: localRules.language === lang ? '#0EA5E9' : 'rgba(255,255,255,0.08)',
                                            background: localRules.language === lang ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255,255,255,0.05)'
                                        }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            flex: 1, padding: '0.75rem', borderRadius: '8px',
                                            border: '1px solid',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {lang === 'en' ? 'English' : '日本語'}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Localized Categories */}
                        <SwitchToggle
                            label={t?.localizedCategories || "Enable Localized Categories"}
                            sublabel={t?.localizedCategoriesSub || "Japan-specific topics"}
                            icon={Globe}
                            value={localRules.localizedCategories}
                            onChange={(val) => updateRule('localizedCategories', val)}
                            confirmGlow={confirmGlow}
                        />

                        {/* Theme - Immediate Effect */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary-gold)', fontSize: '0.9rem', fontWeight: 600 }}>{t?.visualTheme || "Theme"}</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { id: 'classic', label: 'Classic' },
                                    { id: 'neon', label: 'Neon' },
                                    { id: 'minimal', label: 'Minimal' }
                                ].map(themeOpt => (
                                    <motion.button
                                        key={themeOpt.id}
                                        onClick={() => updateRule('theme', themeOpt.id)}
                                        whileTap={{ scale: 0.95 }}
                                        animate={{
                                            borderColor: localRules.theme === themeOpt.id ? 'var(--primary-gold)' : 'rgba(255,255,255,0.08)',
                                            background: localRules.theme === themeOpt.id ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.05)'
                                        }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            flex: 1, padding: '0.75rem', borderRadius: '8px',
                                            border: '1px solid',
                                            color: localRules.theme === themeOpt.id ? 'var(--primary-gold)' : 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {themeOpt.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Privacy Masking */}
                        <SwitchToggle
                            label={t?.privacyMasking || "Privacy Masking"}
                            sublabel={t?.privacyMaskingSub || "Blur secret word until held"}
                            icon={Shield}
                            value={localRules.privacyMasking}
                            onChange={(val) => updateRule('privacyMasking', val)}
                            confirmGlow={confirmGlow}
                        />

                        {/* AI Difficulty */}
                        <PremiumSlider
                            label={t?.aiIntelligence || "AI Intelligence"}
                            value={localRules.aiDifficulty === 'easy' ? 0 : localRules.aiDifficulty === 'medium' ? 1 : 2}
                            onChange={(val) => updateRule('aiDifficulty', val === 0 ? 'easy' : val === 1 ? 'medium' : 'hard')}
                            min={0}
                            max={2}
                            step={1}
                            valueDisplay={localRules.aiDifficulty === 'easy' ? 'Easy' : localRules.aiDifficulty === 'medium' ? 'Medium' : 'Hard'}
                        />

                        {/* Point Multiplier */}
                        <SwitchToggle
                            label={t?.pointMultiplier || "Point Multiplier"}
                            sublabel={t?.pointMultiplierSub || "Enable Double Down betting"}
                            icon={Zap}
                            value={localRules.pointMultiplier}
                            onChange={(val) => updateRule('pointMultiplier', val)}
                            confirmGlow={confirmGlow}
                        />

                        {/* Double Agent (Conditional) */}
                        {playerCount >= 6 && (
                            <SwitchToggle
                                label={t?.doubleAgent || "Double Agent"}
                                sublabel={t?.doubleAgentSub || "2 Imposters mode"}
                                value={localRules.doubleAgent}
                                onChange={(val) => updateRule('doubleAgent', val)}
                                confirmGlow={confirmGlow}
                            />
                        )}

                        {/* Changes auto-save - no button needed */}

                    </div>
                </>
            )}

            {/* AI Modal */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.8)', zIndex: 100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel"
                            style={{ padding: '2rem', width: '90%', maxWidth: '400px', position: 'relative' }}
                        >
                            <button onClick={() => !isGenerating && setShowAIModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} color="var(--accent-purple)" /> {t?.aiGenerate || "Generate Custom Theme"}
                            </h3>
                            <input
                                type="text"
                                placeholder="e.g. 90s Pop Culture, Space Travel..."
                                value={customTheme}
                                onChange={(e) => setCustomTheme(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-ghost" onClick={() => setShowAIModal(false)} style={{ flex: 1 }}>{t?.cancel || "Cancel"}</button>
                                <RippleButton
                                    onClick={handleAIGenerate}
                                    disabled={isGenerating || !customTheme.trim()}
                                    style={{ flex: 1 }}
                                >
                                    {isGenerating ? <Loader2 className="spin" /> : (t?.generate || "Generate")}
                                </RippleButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GameRules;
