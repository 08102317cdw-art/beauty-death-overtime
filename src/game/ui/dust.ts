export function startDust(canvas: HTMLCanvasElement, quiet: boolean): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const motes = Array.from({ length: quiet ? 16 : 34 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.15 + 0.25,
    v: Math.random() * 0.012 + 0.004,
    a: Math.random() * 0.22 + 0.05,
    phase: Math.random() * Math.PI * 2,
  }));
  let frame = 0;
  let stopped = false;
  let request = 0;

  const draw = () => {
    if (stopped) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.max(1, Math.floor(w * dpr));
    const ph = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const mote of motes) {
      if (!quiet) {
        mote.y -= mote.v * 0.22;
        if (mote.y < -0.03) mote.y = 1.03;
      }
      const x = (mote.x + Math.sin(frame * 0.004 + mote.phase) * 0.008) * w;
      const y = mote.y * h * 0.78;
      ctx.beginPath();
      ctx.fillStyle = `rgba(243, 236, 223, ${mote.a})`;
      ctx.arc(x, y, mote.r, 0, Math.PI * 2);
      ctx.fill();
    }
    frame += 1;
    if (!quiet) request = requestAnimationFrame(draw);
  };

  request = requestAnimationFrame(draw);
  return () => {
    stopped = true;
    cancelAnimationFrame(request);
  };
}
