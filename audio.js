// Sound System Parameters
window.audioCtx = null;
window.soundEnabled = true;

// Programmatic Procedural Soundtrack Parameter Registries
window.ambientOsc1 = null;
window.ambientOsc2 = null;
window.ambientGain = null;
window.ambientFilter = null;

// Synthesize Sound Effects Programmatically via Web Audio API
window.initAudio = function() {
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Polish Addition: Fire low-overhead background track loop safely upon first engine interaction
    if (window.soundEnabled && !window.ambientOsc1) {
        window.startAmbientLoop();
    }
};

// Polish Addition: Programmatic generation of non-intrusive interactive sound loops
window.startAmbientLoop = function() {
    if (!window.audioCtx || !window.soundEnabled) return;
    try {
        const now = window.audioCtx.currentTime;
        
        window.ambientFilter = window.audioCtx.createBiquadFilter();
        window.ambientFilter.type = 'lowpass';
        window.ambientFilter.frequency.setValueAtTime(1200, now);

        window.ambientGain = window.audioCtx.createGain();
        window.ambientGain.gain.setValueAtTime(0.002, now); // Attenuated to a virtually imperceptible balance to eliminate background noise distraction

        // Synthesize soft rhythm chords programmatically
        window.ambientOsc1 = window.audioCtx.createOscillator();
        window.ambientOsc1.type = 'triangle';
        window.ambientOsc1.frequency.setValueAtTime(110, now); // Low A hum
        
        window.ambientOsc2 = window.audioCtx.createOscillator();
        window.ambientOsc2.type = 'sine';
        window.ambientOsc2.frequency.setValueAtTime(165, now); // E perfect fifth chord layer

        window.ambientOsc1.connect(window.ambientFilter);
        window.ambientOsc2.connect(window.ambientFilter);
        window.ambientFilter.connect(window.ambientGain);
        window.ambientGain.connect(window.audioCtx.destination);

        window.ambientOsc1.start(now);
        window.ambientOsc2.start(now);
    } catch(err) {
        console.warn("Ambient Audio engine deferred", err);
    }
};

// Polish Addition: Fluidly sweep sound filters down if the player sinks into a river biome lane
window.updateAmbientFilters = function(state) {
    if (!window.audioCtx || !window.ambientFilter || !window.soundEnabled) return;
    const now = window.audioCtx.currentTime;
    if (state === 'underwater') {
        window.ambientFilter.frequency.exponentialRampToValueAtTime(280, now + 0.3);
    } else if (state === 'hazard') {
        // HAZARD MODULATION: Muffle background sound to highlight railway alarm warnings
        window.ambientFilter.frequency.exponentialRampToValueAtTime(420, now + 0.2);
    } else {
        window.ambientFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    }

    // COMBO TEMPO SHIFT: Elevate background harmony pitch node dynamically during high streak play
    if (window.ambientOsc2 && window.currentComboMultiplier) {
        if (window.currentComboMultiplier >= 3) {
            window.ambientOsc2.frequency.setValueAtTime(220, now); // Scale up to octave A chord node
        } else {
            window.ambientOsc2.frequency.setValueAtTime(165, now); // Revert to baseline standard layer
        }
    }
};

window.playSynthSound = function(type) {
    if (!window.soundEnabled || !window.audioCtx) return;
    try {
        if (window.audioCtx.state === 'suspended') {
            window.audioCtx.resume();
        }

        const osc = window.audioCtx.createOscillator();
        const gainNode = window.audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(window.audioCtx.destination);

        const now = window.audioCtx.currentTime;

        if (type === 'jump') {
            osc.type = 'triangle';
            let pitchOffset = ((window.currentComboMultiplier || 1) - 1) * 60;
            osc.frequency.setValueAtTime(150 + pitchOffset, now);
            osc.frequency.exponentialRampToValueAtTime(400 + pitchOffset, now + 0.12);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'score') {
            osc.type = 'sine';
            // Progressive pitch architecture scales frequency up dynamically based on current streak tiers
            let comboBonus = ((window.currentComboMultiplier || 1) - 1) * 45;
            osc.frequency.setValueAtTime(587.33 + comboBonus, now); 
            osc.frequency.setValueAtTime(880 + comboBonus, now + 0.06);   
            gainNode.gain.setValueAtTime(0.08, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'crash_sedan') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(40, now + 0.18);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === 'crash_train') {
            // Programmatic Dual-Frequency Square Crunch
            osc.type = 'square';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
            gainNode.gain.setValueAtTime(0.35, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'splash') {
            // Fluid Low-Pass Sweep Synthesis
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
            gainNode.gain.setValueAtTime(0.25, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'warning') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.linearRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'coin') {
            // ARCADIAN STAR COIN SYNTHESIS: Progressive Arpeggiating High-Chime Ping
            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5 Note
            osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6 High Chime Note
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.linearRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.22);
        }
    } catch (e) {
        console.warn("Audio Context blocked or failed initialization", e);
    }
};

// Toggle Sound Handler wrapped inside DOMContentLoaded listener to guarantee initialization safety
document.addEventListener('DOMContentLoaded', () => {
    const audioToggleBtn = document.getElementById('audioToggle');
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            window.soundEnabled = !window.soundEnabled;
            audioToggleBtn.innerText = window.soundEnabled ? '🔊' : '🔇';
            
            // Handle physical hardware muting hooks fluidly
            if (!window.soundEnabled) {
                if (window.ambientGain && window.audioCtx) { window.ambientGain.gain.setValueAtTime(0, window.audioCtx.currentTime); }
            } else {
                if (!window.ambientOsc1) {
                    window.initAudio();
                } else if (window.ambientGain && window.audioCtx) {
                    window.ambientGain.gain.setValueAtTime(0.002, window.audioCtx.currentTime);
                }
            }
            window.initAudio();
        });
    }
});
