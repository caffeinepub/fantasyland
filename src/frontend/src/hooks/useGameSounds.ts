let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function isMuted(): boolean {
  return localStorage.getItem("sfx-muted") === "true";
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.18,
  startAt?: number,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime);
  const t = startAt ?? ctx.currentTime;
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export function useGameSounds() {
  function playWin() {
    if (isMuted()) return;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((f, i) =>
      playTone(f, 0.12, "sine", 0.22, getCtx().currentTime + i * 0.1),
    );
  }

  function playLose() {
    if (isMuted()) return;
    const notes = [392, 330, 262]; // G4 E4 C4
    notes.forEach((f, i) =>
      playTone(f, 0.18, "sine", 0.18, getCtx().currentTime + i * 0.15),
    );
  }

  function playCorrect() {
    if (isMuted()) return;
    playTone(880, 0.12, "sine", 0.2);
  }

  function playWrong() {
    if (isMuted()) return;
    playTone(150, 0.2, "sawtooth", 0.15);
  }

  function playStart() {
    if (isMuted()) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  }

  function playTick() {
    if (isMuted()) return;
    playTone(600, 0.05, "sine", 0.14);
  }

  function playClick() {
    if (isMuted()) return;
    playTone(400, 0.04, "sine", 0.1);
  }

  function playMatchFound() {
    if (isMuted()) return;
    const notes = [659, 784, 988, 1319]; // E5 G5 B5 E6
    notes.forEach((f, i) =>
      playTone(f, 0.1, "sine", 0.22, getCtx().currentTime + i * 0.08),
    );
  }

  return {
    playWin,
    playLose,
    playCorrect,
    playWrong,
    playStart,
    playTick,
    playClick,
    playMatchFound,
  };
}
