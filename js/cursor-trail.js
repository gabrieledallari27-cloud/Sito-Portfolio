(() => {
  const canvas = document.getElementById("cursorTrail");
  if (!canvas) return;

  // ✅ OFF su mobile/touch (pointer coarse)
  const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (isCoarse) {
    canvas.style.display = "none";
    return;
  }

  // ✅ Respect reduced motion
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  // DPR-safe sizing
  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width  = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", resize, { passive: true });
  resize();

  // Config (accent del tuo sito)
  const cfg = {
    trailMax: 26,
    spawnEvery: 1,
    trailLife: 520,
    burstCount: 18,
    burstLife: 520,
    lineWidth: 2.0,
    dotSize: 3.2,
    glow: 16,
    color: { r: 158, g: 231, b: 255 } // #9ee7ff
  };

  let tick = 0;
  const trail = [];   // {x,y,t}
  const bursts = [];  // {x,y,vx,vy,t,life}

  const now = () => performance.now();

  function addTrailPoint(x, y) {
    trail.push({ x, y, t: now() });
    while (trail.length > cfg.trailMax) trail.shift();
  }

  function spawnBurst(x, y) {
    const t0 = now();
    for (let i = 0; i < cfg.burstCount; i++) {
      const a = (Math.PI * 2) * (i / cfg.burstCount) + (Math.random() * 0.4);
      const sp = 2.2 + Math.random() * 4.0;
      bursts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        t: t0,
        life: cfg.burstLife * (0.85 + Math.random() * 0.35)
      });
    }
  }

  function onMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    if (typeof x !== "number" || typeof y !== "number") return;

    tick++;
    if (tick % cfg.spawnEvery === 0) addTrailPoint(x, y);
  }

  function onDown(e) {
    const x = e.clientX;
    const y = e.clientY;
    if (typeof x !== "number" || typeof y !== "number") return;
    spawnBurst(x, y);
  }

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });

  function rgba(a) {
    const c = cfg.color;
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function drawTrail(t) {
    for (let i = trail.length - 1; i >= 0; i--) {
      if ((t - trail[i].t) > cfg.trailLife) trail.splice(i, 1);
    }
    if (trail.length < 2) return;

    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = cfg.lineWidth;
    ctx.shadowBlur = cfg.glow;
    ctx.shadowColor = rgba(0.55);

    for (let i = 1; i < trail.length; i++) {
      const p0 = trail[i - 1];
      const p1 = trail[i];
      const age = (t - p1.t);
      const k = Math.max(0, 1 - age / cfg.trailLife);
      const a = 0.55 * k;

      ctx.strokeStyle = rgba(a);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }

    const last = trail[trail.length - 1];
    const headAge = (t - last.t);
    const hk = Math.max(0, 1 - headAge / cfg.trailLife);

    ctx.shadowBlur = cfg.glow * 1.1;
    ctx.fillStyle = rgba(0.75 * hk);
    ctx.beginPath();
    ctx.arc(last.x, last.y, cfg.dotSize * (0.9 + hk * 0.35), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawBursts(t) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      const age = t - p.t;
      if (age > p.life) { bursts.splice(i, 1); continue; }

      p.vx *= 0.985;
      p.vy *= 0.985;
      p.vy += 0.02;
      p.x += p.vx * 2.2;
      p.y += p.vy * 2.2;
    }
    if (!bursts.length) return;

    ctx.save();
    ctx.shadowBlur = cfg.glow;
    ctx.shadowColor = rgba(0.6);

    for (const p of bursts) {
      const age = t - p.t;
      const k = Math.max(0, 1 - age / p.life);
      const e = easeOutCubic(1 - k);
      const a = 0.75 * k;

      ctx.fillStyle = rgba(a);
      const r = 2.0 + e * 3.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function frame() {
    const t = now();
    ctx.clearRect(0, 0, W, H);
    drawTrail(t);
    drawBursts(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();