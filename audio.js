// Sound System Parameters
window.audioCtx = null;
window.soundEnabled = true;

// Synthesize Sound Effects Programmatically via Web Audio API
window.initAudio = function() {
    if (!window.audioCtx) {
        window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
            osc.frequency.setValueAtTime(587.33, now); 
            osc.frequency.setValueAtTime(880, now + 0.06);   
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
        }
    } catch (e) {
        console.warn("Audio Context blocked or failed initialization", e);
    }
};

// Toggle Sound Handler wrapped inside DOMContentLoaded listener to guarantee initialization safety
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('audioToggle').addEventListener('click', () => {
        window.soundEnabled = !window.soundEnabled;
        document.getElementById('audioToggle').innerText = window.soundEnabled ? '🔊' : '🔇';
        window.initAudio();
    });
});