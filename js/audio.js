let soundEnabled = true;
    function playChime(type = 'bell') {
      if (!soundEnabled) return;
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (type === 'bell') {
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
          osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
          osc1.start(); osc2.start();
          osc1.stop(audioCtx.currentTime + 1.2); osc2.stop(audioCtx.currentTime + 1.2);
        } else if (type === 'alert') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
          osc.connect(gain); gain.connect(audioCtx.destination);
          osc.start(); osc.stop(audioCtx.currentTime + 0.4);
        }
      } catch (err) {
        console.warn('Audio playback error', err);
      }
    }

    function toggleAudioChime() {
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('audio-toggle-btn');
      const icon = document.getElementById('audio-icon');

      if (soundEnabled) {
        if (btn) {
          btn.className = "header-ctrl-btn px-2 rounded-xl bg-pastel-mint/20 border border-pastel-mint/40 text-pastel-mint text-xs active:scale-95 transition flex items-center justify-center shrink-0";
          btn.title = "App Audio: Sound ON (Tap to Mute)";
        }
        if (icon) icon.setAttribute('data-lucide', 'volume-2');
        if (window.lucide) lucide.createIcons();
        playChime('bell');
        alertBox("Sound effects & completion chimes enabled.", "Sound ON");
      } else {
        if (btn) {
          btn.className = "header-ctrl-btn px-2 rounded-xl bg-dark-elevated border border-dark-border text-slate-500 text-xs active:scale-95 transition flex items-center justify-center shrink-0";
          btn.title = "App Audio: Sound OFF / Muted (Tap to Unmute)";
        }
        if (icon) icon.setAttribute('data-lucide', 'volume-x');
        if (window.lucide) lucide.createIcons();
        alertBox("Sound effects & completion chimes muted.", "Sound OFF");
      }
    }
