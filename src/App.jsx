import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GameBackground from './components/GameBackground';
import Lobby from './components/Lobby';
import GameRules from './components/GameRules';
import PlayerTransition from './components/PlayerTransition';
import RoleReveal from './components/RoleReveal';
import CluePhase from './components/CluePhase';
import VotingPhase from './components/VotingPhase';
import Resolution from './components/Resolution';
import categoriesData from './data/categories.json';
import { generateStrategicClue, generateStrategicGuess } from './utils/aiService';

// Constants
const PHASES = {
  LOBBY: 'LOBBY',
  RULES: 'RULES',
  REVEAL_TRANSITION: 'REVEAL_TRANSITION',
  REVEAL: 'REVEAL',
  CLUE: 'CLUE',
  VOTING: 'VOTING',
  RESOLUTION: 'RESOLUTION'
};

function App() {
  const [phase, setPhase] = useState(PHASES.LOBBY);
  const [players, setPlayers] = useState([]);
  const [gameConfig, setGameConfig] = useState(null);
  const [rules, setRules] = useState({
    clueRounds: 1,
    timerEnabled: true,
    timerDuration: 60,
    fairPlayEnabled: true,
    selectedCategories: [],
    // Advanced Settings
    privacyMasking: false,
    hardMode: false,
    aiDifficulty: 'medium', // 'easy', 'medium', 'hard'
    doubleAgent: false,
    theme: 'classic', // 'classic', 'neon', 'minimal'
    language: 'en', // 'en', 'jp'
    pointMultiplier: false
  });

  // Apply Visual Theme
  useEffect(() => {
    document.body.setAttribute('data-theme', rules.theme);
  }, [rules.theme]);

  // Turn State
  const [revealIndex, setRevealIndex] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [clues, setClues] = useState([]);

  // Resolution State
  const [resolutionMode, setResolutionMode] = useState(null); // 'guess' | 'reveal'
  const [resolutionOutcome, setResolutionOutcome] = useState(null);

  // --- Actions ---

  const addPlayer = (name, isAI) => {
    const newPlayer = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      name,
      isAI,
      score: 0
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const goToRules = () => {
    if (players.length < 3) return;
    setPhase(PHASES.RULES);
  };

  const goBackToLobby = () => {
    setPhase(PHASES.LOBBY);
  };


  const handleRulesConfirm = (newRules) => {
    setRules(newRules);
    initializeGame(newRules);
  };

  const initializeGame = (currentRules) => {
    let category, secretWord;

    if (currentRules.customCategory) {
      // Use the AI generated / Custom category
      category = currentRules.customCategory;
      const wordIndex = Math.floor(Math.random() * category.words.length);
      secretWord = category.words[wordIndex];
    } else {
      // Select Category from configured rules
      const availableCategories = categoriesData.categories.filter(c => currentRules.selectedCategories.includes(c.id));
      // Fallback if empty (shouldn't happen due to validation)
      const validCategories = availableCategories.length > 0 ? availableCategories : categoriesData.categories;

      const catIndex = Math.floor(Math.random() * validCategories.length);
      category = validCategories[catIndex];
      const wordIndex = Math.floor(Math.random() * category.words.length);
      secretWord = category.words[wordIndex];
    }

    // 1. Assign Roles (Handle Double Agent)
    const totalPlayers = players.length;
    const imposterCount = (currentRules.doubleAgent && totalPlayers >= 6) ? 2 : 1;

    // Create local set of Imposter Indices
    const imposterIndices = new Set();
    while (imposterIndices.size < imposterCount) {
      imposterIndices.add(Math.floor(Math.random() * totalPlayers));
    }

    const assignedPlayers = players.map((p, i) => ({
      ...p,
      role: imposterIndices.has(i) ? 'imposter' : 'civilian'
    }));

    // 2. Shuffle Order
    let turnOrder = [...assignedPlayers].sort(() => Math.random() - 0.5);

    // 3. Fair Play Logic (Prevent any Imposter from being Player 0)
    if (currentRules.fairPlayEnabled && turnOrder.length > 1) {
      if (turnOrder[0].role === 'imposter') {
        // Find first non-imposter index to swap
        const safeIndices = turnOrder
          .map((p, idx) => (p.role !== 'imposter' && idx !== 0) ? idx : -1)
          .filter(idx => idx !== -1);

        if (safeIndices.length > 0) {
          const swapIndex = safeIndices[Math.floor(Math.random() * safeIndices.length)];
          [turnOrder[0], turnOrder[swapIndex]] = [turnOrder[swapIndex], turnOrder[0]];
        }
      }
    }

    setPlayers(turnOrder);
    const imposters = turnOrder.filter(p => p.role === 'imposter');

    setGameConfig({
      category: category.name,
      categoryId: category.id,
      words: category.words,
      secretWord,
      imposterId: imposters[0].id, // Legacy support for single, logic should check array
      imposterIds: imposters.map(p => p.id),
      language: currentRules.language || 'en',
      aiDifficulty: currentRules.aiDifficulty || 'medium'
    });
    setClues([]);

    // Start Game
    setPhase(PHASES.REVEAL_TRANSITION);
  };

  const handleReroll = () => {
    initializeGame(rules);
  };

  const handleExit = () => {
    if (window.confirm("Quit Game? Progress will be lost.")) {
      setPhase(PHASES.LOBBY);
    }
  };

  const onTransitionReady = () => {
    setPhase(PHASES.REVEAL);
  };

  const nextReveal = () => {
    if (revealIndex < players.length - 1) {
      setRevealIndex(revealIndex + 1);
      setPhase(PHASES.REVEAL_TRANSITION);
    } else {
      setPhase(PHASES.CLUE);
    }
  };

  // Optimized AI Experience: Skip Reveal for AI
  useEffect(() => {
    if ((phase === PHASES.REVEAL || phase === PHASES.REVEAL_TRANSITION) && players[revealIndex]?.isAI) {
      // Automatically proceed
      const timer = setTimeout(() => {
        nextReveal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, revealIndex, players]);

  // Turn management for Clues
  useEffect(() => {
    if (phase === PHASES.CLUE) {
      const currentPlayer = players[clueIndex];
      // Check if AI
      if (currentPlayer?.isAI) {
        const timeout = setTimeout(() => {
          generateAIClue(currentPlayer);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [phase, clueIndex]);

  const generateAIClue = async (player) => {
    // AI Logic: Pick a word effectively
    const { words, secretWord, category } = gameConfig;

    let finalClue = null;

    try {
      const strategicClue = await generateStrategicClue({
        role: player.role,
        secretWord,
        categoryName: category,
        existingClues: clues,
        allWords: words,
        language: gameConfig.language,
        aiDifficulty: gameConfig.aiDifficulty
      });
      if (strategicClue) finalClue = strategicClue;
    } catch (e) {
      console.error("Strategic Clue Error", e);
    }

    // Fallback
    if (!finalClue) {
      let clue = "";
      if (player.role === 'civilian') {
        const otherWords = words.filter(w => w !== secretWord);
        clue = otherWords[Math.floor(Math.random() * otherWords.length)];
      } else {
        clue = words[Math.floor(Math.random() * words.length)];
      }
      const phrases = ["Like", "Maybe", "Related to", "Sort of", ""];
      const prefix = phrases[Math.floor(Math.random() * phrases.length)];
      finalClue = prefix ? `${prefix} ${clue}` : clue;
    }

    handleClueSubmit(finalClue);
  };

  const handleClueSubmit = (text) => {
    const newClues = [...clues, {
      playerId: players[clueIndex].id,
      playerName: players[clueIndex].name,
      text
    }];
    setClues(newClues);

    if (clueIndex < players.length - 1) {
      setClueIndex(clueIndex + 1);
    } else {
      // End of round
      if (currentRound < rules.clueRounds) {
        // Start next round
        setCurrentRound(currentRound + 1);
        setClueIndex(0);
      } else {
        // All rounds done
        setPhase(PHASES.VOTING);
      }
    }
  };

  const handleVoteComplete = (votes) => {
    const voteCounts = {};
    players.forEach(p => voteCounts[p.id] = 0);
    Object.values(votes).forEach(voteVal => {
      const targetId = typeof voteVal === 'object' ? voteVal.target : voteVal;
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let mostVotedId = null;
    Object.entries(voteCounts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVotedId = id;
      }
    });

    if (mostVotedId === gameConfig.imposterId) {
      setResolutionMode('guess');
      setPhase(PHASES.RESOLUTION);
    } else {
      startResolution('imposter_win');
    }
  };

  const handleImposterGuess = (word) => {
    if (word === gameConfig.secretWord) {
      startResolution('imposter_win');
    } else {
      startResolution('civilian_win');
    }
  };

  const startResolution = (outcome) => {
    setResolutionMode('reveal');
    setResolutionOutcome(outcome);
    setPhase(PHASES.RESOLUTION);
  };

  const handleTimeExpired = () => {
    setPhase(PHASES.VOTING);
  };

  const restartGame = () => {
    setPhase(PHASES.LOBBY);
  };

  return (
    <>
      <GameBackground />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>

        {phase !== PHASES.LOBBY && phase !== PHASES.RULES && (
          <button
            onClick={handleExit}
            className="btn-ghost"
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              zIndex: 50,
              width: '40px',
              height: '40px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <X size={24} color="var(--text-secondary)" />
          </button>
        )}

        <AnimatePresence mode="wait">
          {phase === PHASES.LOBBY && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Lobby
                players={players}
                onAddPlayer={addPlayer}
                onRemovePlayer={removePlayer}
                onStartGame={goToRules}
              />
            </motion.div>
          )}

          {phase === PHASES.RULES && (
            <motion.div key="rules" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <GameRules onStart={handleRulesConfirm} onBack={goBackToLobby} initialValues={rules} playerCount={players.length} />
            </motion.div>
          )}

          {phase === PHASES.REVEAL_TRANSITION && (
            <motion.div key="transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PlayerTransition
                playerName={players[revealIndex].name}
                onReady={onTransitionReady}
              />
            </motion.div>
          )}

          {phase === PHASES.REVEAL && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <RoleReveal
                playerName={players[revealIndex].name}
                role={players[revealIndex].role}
                category={gameConfig.category}
                secretWord={gameConfig.secretWord}
                onNext={nextReveal}
                isLast={revealIndex === players.length - 1}
                isFirstPlayer={revealIndex === 0}
                onReroll={handleReroll}
                privacyEnabled={rules.privacyMasking}
              />
            </motion.div>
          )}

          {phase === PHASES.CLUE && (
            <motion.div key="clue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <CluePhase
                currentPlayer={players[clueIndex]}
                clues={clues}
                onSubmitClue={handleClueSubmit}
                initialTime={rules.timerEnabled ? rules.timerDuration : 0}
                showTimer={rules.timerEnabled}
                onTimeExpired={handleTimeExpired}
              />
            </motion.div>
          )}

          {phase === PHASES.VOTING && (
            <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <VotingPhase
                players={players}
                onVoteComplete={handleVoteComplete}
                allowDoubleDown={rules.pointMultiplier}
              />
            </motion.div>
          )}

          {phase === PHASES.RESOLUTION && (
            <motion.div key="resolution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Resolution
                mode={resolutionMode}
                imposter={players.find(p => p.id === gameConfig.imposterId)}
                outcome={resolutionOutcome}
                secretWord={gameConfig.secretWord}
                categoryWords={gameConfig.words}
                onImposterGuess={handleImposterGuess}
                onPlayAgain={restartGame}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
