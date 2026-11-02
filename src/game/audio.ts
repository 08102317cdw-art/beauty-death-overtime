type Sting = "tick" | "card" | "stamp" | "death" | "crown";

export class AudioDirector {
  muted = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private pulseTimer = 0;
  private started = false;

  constructor() {
    try {
      this.muted = localStorage.getItem("bdo-muted") === "1";
    } catch {
      this.muted = false;
    }
  }

  unlock(): void {
    if (this.started) {
      if (this.ctx?.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.85;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.started = true;
    this.drone(ctx, master);
    if (ctx.state === "suspended") void ctx.resume();
  }

  toggle(): void {
    this.muted = !this.muted;
    try {
      localStorage.setItem("bdo-muted", this.muted ? "1" : "0");
    } catch {
      /* private mode */
    }
    if (!this.started && !this.muted) {
      this.unlock();
      return;
    }
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 0.85, now + 0.06);
  }

  setPulse(on: boolean): void {
    if (on && !this.pulseTimer) {
      this.pulseTimer = window.setInterval(() => this.thump(), 920);
    } else if (!on && this.pulseTimer) {
      window.clearInterval(this.pulseTimer);
      this.pulseTimer = 0;
    }
  }

  sting(kind: Sting): void {
    this.unlock();
    if (!this.ctx || !this.master) return;
    if (kind === "tick") this.blip(880, 0.03, 0.02);
    if (kind === "card") this.blip(420, 0.09, 0.04);
    if (kind === "stamp") this.blip(180, 0.16, 0.07);
    if (kind === "death") this.swell([196, 185], 0.7, 0.08);
    if (kind === "crown") this.swell([392, 587], 0.9, 0.05);
  }

  private drone(ctx: AudioContext, master: GainNode): void {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 240;
    const gain = ctx.createGain();
    gain.gain.value = 0.09;
    filter.connect(gain);
    gain.connect(master);
    for (const freq of [55, 82.4, 110]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
  }

  private blip(freq: number, dur: number, amp: number): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(amp, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  private swell(freqs: number[], dur: number, amp: number): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    }
  }

  private thump(): void {
    this.blip(62, 0.18, 0.06);
  }
}
