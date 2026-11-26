let soundEnabled = true;
try {
  soundEnabled = localStorage.getItem('focusflow_sound_enabled') !== 'false';
} catch (err) {
  soundEnabled = true;
}

function playChime(type = 'bell') {
  if (!soundEnabled) return;
  // Silence routine UI chimes ('bell', 'pop', etc.); only allow purposeful alert types.
  if (type !== 'timer' && type !== 'alert' && type !== 'scan') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const now = audioCtx.currentTime;

    if (type === 'timer') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.14);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'alert') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(523.25, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'scan') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    console.warn('Audio playback error', err);
  }
}

function syncAudioToggleUI() {
  const btn = document.getElementById('audio-toggle-btn');
  const icon = document.getElementById('audio-icon');

  if (soundEnabled) {
    if (btn) {
      btn.className = "header-ctrl-btn px-2 rounded-xl bg-pastel-mint/20 border border-pastel-mint/40 text-pastel-mint text-xs active:scale-95 transition flex items-center justify-center shrink-0";
      btn.title = "App Audio: Alerts ON (Tap to Mute)";
    }
    if (icon) icon.setAttribute('data-lucide', 'volume-2');
  } else {
    if (btn) {
      btn.className = "header-ctrl-btn px-2 rounded-xl bg-dark-elevated border border-dark-border text-slate-500 text-xs active:scale-95 transition flex items-center justify-center shrink-0";
      btn.title = "App Audio: Muted (Tap to Unmute)";
    }
    if (icon) icon.setAttribute('data-lucide', 'volume-x');
  }
  if (window.lucide) lucide.createIcons();
}

function toggleAudioChime() {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem('focusflow_sound_enabled', soundEnabled ? 'true' : 'false');
  } catch (err) {}

  syncAudioToggleUI();

  if (soundEnabled) {
    playChime('timer');
    alertBox("Timer & barcode scan alerts enabled.", "Sound ON");
  } else {
    alertBox("All app sounds muted.", "Sound OFF");
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAudioToggleUI);
  } else {
    syncAudioToggleUI();
  }
}
