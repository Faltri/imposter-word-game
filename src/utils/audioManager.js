import { Howl } from 'howler';

let useSynthFallback = false;

// 1. Initialize Howler with expected sprite file
// Users should place 'game_sfx.mp3' in the public folder.
const globalSound = new Howl({
    src: ['/game_sfx.mp3'],
    sprite: {
        correct: [0, 800],      // Ding
        fail: [1000, 1000],     // Buzz/Fail
        tick: [2500, 100],      // Short Tick
        fanfare: [4000, 2000]   // Victory Swell
    },
    onloaderror: (id, err) => {
        console.warn("Audio Sprite failed to load (missing file?). Enabling Synth Fallback.", err);
        useSynthFallback = true;
    },
    onload: () => {
        console.log("Audio Sprite Loaded.");
    }
});

// 2. Web Audio API Fallback (Synthesizer)
// Provides immediate feedback even if assets are missing
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playSynth = (type) => {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch (type) {
        case 'correct':
            // High Ding: Sine wave, high pitch decay
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;

        case 'fail':
            // Low Buzz: Sawtooth, dissonant
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;

        case 'tick':
            // Short tick: Square wave, very short
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;

        case 'fanfare':
            // Major arpeggio
            const playNote = (freq, time, dur) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'triangle';
                o.frequency.value = freq;
                o.connect(g);
                g.connect(audioCtx.destination);
                g.gain.setValueAtTime(0.2, time);
                g.gain.linearRampToValueAtTime(0, time + dur);
                o.start(time);
                o.stop(time + dur);
            };
            playNote(523.25, now, 0.3); // C5
            playNote(659.25, now + 0.1, 0.3); // E5
            playNote(783.99, now + 0.2, 0.6); // G5
            playNote(1046.50, now + 0.4, 0.8); // C6
            break;
    }
};

// 3. Exported Trigger Function
export const playSound = (type) => {
    // Haptic Feedback Bridge
    if (navigator.vibrate) {
        if (type === 'tick') navigator.vibrate(5);
        if (type === 'correct') navigator.vibrate([50, 50, 50]);
        if (type === 'fail') navigator.vibrate(200);
        if (type === 'fanfare') navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Audio Trigger
    if (useSynthFallback || globalSound.state() !== 'loaded') {
        playSynth(type);
    } else {
        globalSound.play(type);
    }
};
