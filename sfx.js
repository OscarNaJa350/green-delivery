/* Oscar SFX — WebAudio synth, no assets. Always-on. File:// safe. Loaded before script.js */
(function () {
  var ctx = null, ambientNodes = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when, slideTo) {
    var c = ac(); if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.08, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  var SFX = {
    click: function () { tone(660, 0.07, 'triangle', 0.05); },
    tab: function () { tone(520, 0.08, 'triangle', 0.06); tone(780, 0.1, 'sine', 0.05, 0.06); },
    toast: function () { tone(880, 0.09, 'sine', 0.05); },
    success: function () { tone(523, 0.12, 'sine', 0.07); tone(659, 0.12, 'sine', 0.07, 0.1); tone(784, 0.2, 'sine', 0.07, 0.2); },
    coin: function () { tone(988, 0.08, 'square', 0.03); tone(1319, 0.18, 'square', 0.03, 0.07); },
    badge: function () { tone(392, 0.15, 'triangle', 0.07); tone(523, 0.15, 'triangle', 0.07, 0.12); tone(659, 0.15, 'triangle', 0.07, 0.24); tone(784, 0.3, 'triangle', 0.08, 0.36); },
    levelup: function () { tone(440, 0.12, 'sawtooth', 0.04, 0, 880); tone(660, 0.15, 'sawtooth', 0.04, 0.12, 1320); },
    error: function () { tone(220, 0.15, 'sawtooth', 0.05, 0, 160); },
    whoosh: function () { tone(300, 0.2, 'sine', 0.04, 0, 900); },
    pop: function () { tone(500, 0.06, 'sine', 0.06, 0, 900); }
  };
  function startAmbient() {
    var c = ac(); if (!c || ambientNodes) return;
    try {
      var g = c.createGain(); g.gain.value = 0.015; g.connect(c.destination);
      // Gentle airy pad: two detuned sines + slow LFO
      var o1 = c.createOscillator(), o2 = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain();
      o1.type = 'sine'; o1.frequency.value = 174; o2.type = 'sine'; o2.frequency.value = 261.6;
      lfo.type = 'sine'; lfo.frequency.value = 0.08; lg.gain.value = 0.008;
      lfo.connect(lg); lg.connect(g.gain);
      // Soft bird-chirp texture every ~7s
      o1.connect(g); o2.connect(g); o1.start(); o2.start(); lfo.start();
      ambientNodes = { g: g };
      setInterval(function () {
        if (!document.hidden) { tone(2400 + Math.random() * 800, 0.12, 'sine', 0.012, 0, 3200); tone(2800 + Math.random() * 600, 0.1, 'sine', 0.01, 0.15, 2200); }
      }, 7000);
    } catch (e) {}
  }
  // Unlock audio on first gesture, then start ambient
  function unlock() { ac(); startAmbient(); document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', unlock); }
  document.addEventListener('pointerdown', unlock);
  document.addEventListener('keydown', unlock);
  // Global click blip (delegated, quiet)
  document.addEventListener('click', function (e) {
    var el = e.target.closest('button, .nav-tab, .category-box, a');
    if (el) SFX.click();
  });
  window.SFX = SFX;
})();
