/* SAHNE 1 — ÜÇGEN (0–10 s)  Aynı biçimde, daha büyük.
   The whole film's drawing lives in LI.world(t); each scene only sets the camera. */
(function (LI) {
  'use strict';
  const { seg, lerp, inOut } = LI.E;
  const KD = LI.KD, F = () => LI.Film, A = LI.Ang, Ink = LI.Ink;
  const END = (t) => 1 - seg(t, 90.4, 91.4);

  function win(t, a, b, fi = 0.4, fo = 0.4) { return seg(t, a, a + fi) * (1 - seg(t, b - fo, b)); }
  function exprs(ctx, t, P, list, sz) {
    const f = F();
    list.forEach(([a, b, items, hot]) => {
      const al = win(t, a, b); if (al <= 0) return;
      f.expr(ctx, typeof items === 'string' ? [items] : items, P.x, P.y, sz ?? P.s, { alpha: al, w: P.w, halo: true, color: hot ? A.amber : undefined });
    });
  }
  const at = (P, k, y) => ({ x: P.x, y: y ?? P.y[k], s: P.s, w: P.w });
  const amber = (a) => `rgba(${LI.AMBER_RGB},${a})`;
  const fr = (n, d, h) => F().fr(n, d, h);
  const neg = (s) => s.replace('-', '−');
  const label = (v) => (v < 0 ? neg(String(v)) : String(v));

  /* ---- boxes and equal objects: cabinet projection, x right, y back, z up ---- */
  const Pj = (O, c, x, y, z) => [O[0] + x * c + y * c * 0.5, O[1] - z * c - y * c * 0.5];
  function poly(ctx, P, a, fill, seed, w = 3) {
    ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    fill.forEach((f) => { if (f) { ctx.fillStyle = f; ctx.fill(); } });
    Ink.path(ctx, P.concat([P[0]]), { w, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** a solid block x..x+dx, y..y+dy, z..z+dz */
  function block(ctx, O, c, x, y, z, dx, dy, dz, a, h, seed) {
    if (a <= 0) return;
    const P = (i, j, k) => Pj(O, c, x + i * dx, y + j * dy, z + k * dz), H = h > 0 ? amber(a * 0.6 * h) : null;
    poly(ctx, [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)], a, [amber(a * 0.2), H], seed, 2.5);
    poly(ctx, [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.14})`, H], seed + 1, 2.5);
    poly(ctx, [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], a, [`rgba(${LI.INK_RGB},${a * 0.04})`, H], seed + 2, 2.5);
  }
  function ball(ctx, O, c, x, y, z, a, seed) {
    if (a <= 0) return; const C = Pj(O, c, x + 0.5, y + 0.5, z + 0.5), r = c * 0.47;
    ctx.beginPath(); ctx.arc(C[0], C[1], r, 0, 7);
    ctx.fillStyle = `rgba(${LI.PAPER_RGB},${a})`; ctx.fill();
    const g = ctx.createRadialGradient(C[0] - r * 0.35, C[1] - r * 0.35, r * 0.1, C[0], C[1], r);
    g.addColorStop(0, amber(a * 0.12)); g.addColorStop(1, amber(a * 0.45)); ctx.fillStyle = g; ctx.fill();
    const P = []; for (let i = 0; i <= 28; i++) P.push([C[0] + r * Math.cos(i / 28 * 6.2832), C[1] + r * Math.sin(i / 28 * 6.2832)]);
    Ink.path(ctx, P, { w: 2.5, alpha: a * 0.9, seed, taper: [0, 0] });
  }
  /** items [{x,y,z,dx,dy,dz}] in painter's order, each with a fill index i */
  function fillList(L, W, H, dx = 1) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x += dx) out.push({ x, y, z, dx, dy: 1, dz: 1 });
    out.forEach((q, i) => (q.i = i));
    return out.slice().sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  const shown = (t, t0, dt, n) => Math.max(0, Math.min(n, Math.floor((t - t0) / dt + 0.4)));
  /** an open glass box: back walls first, then the contents, then the front edges */
  function container(ctx, O, c, L, W, H, a, seed, draw) {
    if (a <= 0) return;
    const P = (x, y, z) => Pj(O, c, x, y, z), ink = `rgba(${LI.INK_RGB},${a * 0.05})`;
    poly(ctx, [P(0, W, 0), P(L, W, 0), P(L, W, H), P(0, W, H)], a * 0.8, [ink], seed, 2);
    poly(ctx, [P(0, 0, 0), P(0, W, 0), P(0, W, H), P(0, 0, H)], a * 0.8, [ink], seed + 1, 2);
    poly(ctx, [P(0, 0, 0), P(L, 0, 0), P(L, W, 0), P(0, W, 0)], a * 0.8, [ink], seed + 2, 2);
    if (draw) draw();
    [[[0, 0, 0], [L, 0, 0]], [[L, 0, 0], [L, 0, H]], [[L, 0, H], [0, 0, H]], [[0, 0, H], [0, 0, 0]], [[L, 0, 0], [L, W, 0]], [[L, W, 0], [L, W, H]], [[L, W, H], [L, 0, H]], [[0, W, H], [L, W, H]], [[0, 0, H], [0, W, H]]]
      .forEach(([p, q], i) => Ink.path(ctx, [P(...p), P(...q)], { w: 3, alpha: a * 0.85, seed: seed + 10 + i, taper: [0, 0] }));
  }
  function fillBox(ctx, O, c, L, W, H, t, t0, dt, a, seed, kind = 'cube', hot = 0) {
    const dx = kind === 'brick' ? 2 : 1, items = fillList(L, W, H, dx);
    container(ctx, O, c, L, W, H, a, seed, () => items.forEach((q) => {
      const k = seg(t, t0 + q.i * dt, t0 + q.i * dt + 0.35); if (k <= 0) return;
      const dz = (1 - inOut(k)) * (H + 1 - q.z);
      if (kind === 'ball') ball(ctx, O, c, q.x, q.y, q.z + dz, a * k, seed + 100 + q.i * 3);
      else block(ctx, O, c, q.x, q.y, q.z + dz, q.dx, 1, 1, a * k, hot, seed + 100 + q.i * 3);
    }));
    return items.length;
  }
  function tag(ctx, env, O, c, L, text, a, hot) {
    if (a <= 0) return; const s = KD.L(env).G.s;
    F().T(ctx, text, O[0] + L * c / 2, O[1] + s * 0.95, { size: s * 0.66, alpha: a, halo: true, color: hot ? A.amber : undefined });
  }
  /** cubes of an L × W × H prism; when(q) gives each cube's arrival time (Infinity = never) */
  function cubes(L, W, H) {
    const out = [];
    for (let z = 0; z < H; z++) for (let y = W - 1; y >= 0; y--) for (let x = 0; x < L; x++) out.push({ x, y, z });
    return out.sort((p, q) => q.y - p.y || p.x - q.x || p.z - q.z);
  }
  function fillT(ctx, O, c, B, t, a, when, hot, seed) {
    let n = 0;
    container(ctx, O, c, B[0], B[1], B[2], a, seed, () => cubes(...B).forEach((q, i) => {
      const t0 = when(q); if (!(t >= t0)) return; n++;
      const k = seg(t, t0, t0 + 0.3);
      block(ctx, O, c, q.x, q.y, q.z + (1 - inOut(k)) * 1.2, 1, 1, 1, a * k, hot ? hot(q) : 0, seed + 100 + i * 3);
    }));
    return n;
  }
  function edges(ctx, env, O, c, B, a, labels) {
    if (a <= 0) return; const s = KD.L(env).G.s, o = { size: s * 0.7, alpha: a, halo: true, color: A.amber };
    const m = (p, q) => { const P = Pj(O, c, ...p), Q = Pj(O, c, ...q); return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2]; };
    const [L, W, H] = B;
    let q = m([0, 0, 0], [L, 0, 0]); F().T(ctx, labels[0], q[0], q[1] + 36, o);
    q = m([L, 0, 0], [L, W, 0]); F().T(ctx, labels[1], q[0] + 50, q[1] + 12, o);
    q = m([L, W, 0], [L, W, H]); F().T(ctx, labels[2], q[0] + 48, q[1], o);
  }
  function tally(ctx, env, t, rows) {
    const T = KD.L(env).TL;
    rows.forEach(([t0, t1, txt, hot], i) => { const al = win(t, t0, t1) * END(t); if (al > 0) F().T(ctx, txt, T.x, T.y[i], { size: T.s, alpha: al, halo: true, color: hot ? A.amber : undefined }); });
  }

  function dashL(ctx, p, q, a, seed, color, w = 2.5) {
    if (a <= 0) return; const n = Math.max(6, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / 14));
    for (let j = 0; j < n; j += 2) Ink.path(ctx, [[lerp(p[0], q[0], j / n), lerp(p[1], q[1], j / n)], [lerp(p[0], q[0], (j + 1) / n), lerp(p[1], q[1], (j + 1) / n)]], { w, alpha: a, seed: seed + j, taper: [0, 0], color });
  }
  function seg2(ctx, p, q, a, k, seed, color, w = 3.5) { if (a > 0 && k > 0) Ink.path(ctx, [p, [lerp(p[0], q[0], k), lerp(p[1], q[1], k)]], { w, alpha: a, seed, taper: [0, 0], color }); }
  function dot(ctx, p, a, color) { if (a <= 0) return; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.fillStyle = color ? `rgba(${color},${a})` : `rgba(${LI.INK_RGB},${a})`; ctx.fill(); }
  function txt(ctx, env, p, s, a, hot, sz = 0.8) { if (a > 0) F().T(ctx, s, p[0], p[1], { size: KD.L(env).G.s * sz, alpha: a, halo: true, color: hot ? A.amber : undefined }); }
  function arcAt(ctx, C, r, u0, u1, a, seed, color) {
    if (a <= 0) return; const P = []; for (let j = 0; j <= 16; j++) { const u = lerp(u0, u1, j / 16); P.push([C[0] + r * Math.cos(u), C[1] + r * Math.sin(u)]); }
    Ink.path(ctx, P, { w: 2.5, alpha: a, seed, taper: [0, 0], color });
  }
  const TB = [-2.75, 0], TC = [2.75, 0], TA = [-0.75, -3.2], K = 1.5;
  const W2 = (env, side, p, k = 1) => { const T = KD.L(env).TW, c = T[side]; return [c[0] + p[0] * T.u * k, c[1] + p[1] * T.u * k]; };
  function triangle(ctx, env, pts, a, seed, color, w = 4) { if (a > 0) Ink.path(ctx, [pts[0], pts[1], pts[2], pts[0]], { w, alpha: a, seed, taper: [0, 0], color }); }
  function names(ctx, env, pts, a, s, pr = '') { if (a <= 0) return; const o = [[0, -28], [-22, 22], [22, 22]]; ['A', 'B', 'C'].forEach((n, i) => F().T(ctx, n + pr, pts[i][0] + o[i][0], pts[i][1] + o[i][1], { size: s * 0.62, alpha: a, halo: true })); }
  function angMark(ctx, V, P, Q, r, a, seed, color) { if (a <= 0) return; const u0 = Math.atan2(P[1] - V[1], P[0] - V[0]), u1 = Math.atan2(Q[1] - V[1], Q[0] - V[0]); let d = u1 - u0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; arcAt(ctx, V, r, u0, u0 + d, a, seed, color || LI.AMBER_RGB); }
  const lerpP = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  /** shrink the copy (unit shape pts0, scale k, on the right) back onto the original */
  function shrinkTest(ctx, env, pts0, k, t, t0, a, fits, seed) {
    const e = inOut(seg(t, t0, t0 + 1.6)); if (a <= 0 || e <= 0) return;
    const T = KD.L(env).TW, c = lerpP(T.R, T.L, e), sc = lerp(k, 1, e);
    const pts = pts0.map((p) => [c[0] + p[0] * T.u * sc, c[1] + p[1] * T.u * sc]);
    triangle(ctx, env, pts, a * 0.85, seed, LI.AMBER_RGB, 3);
    const v = a * seg(t, t0 + 1.7, t0 + 2.1), s = KD.L(env).G.s;
    if (v > 0) F().T(ctx, fits ? 'küçültünce örtüştü ✓' : 'örtüşmüyor ✗', T.L[0], T.L[1] + s * 1.4, { size: s * 0.8, alpha: v, halo: true, color: fits ? A.amber : undefined });
  }
  const R = (env, p) => W2(env, 'R', p, K);

  function context(ctx, env, t) {
    exprs(ctx, t, KD.L(env).CX, [
      [4.4, 10.2, 'Aynı biçimde, 1,5 kat büyük bir üçgen çizelim'],
      [10.6, 27.8, 'İki açı (AA)'],
      [28.4, 45.8, 'Orantılı kenarlar (KKK, KAK)'],
      [46.4, 63.8, 'Her benzeyen benzer mi?'],
      [64.4, 79.8, 'Önermeler ve kullanımı'],
    ]);
  }

  function figure(ctx, env, t) {
    const a = END(t), s = KD.L(env).G.s;
    const O = [TA, TB, TC].map((p) => W2(env, 'L', p));
    const aO = a * win(t, 4.6, 79.8);
    triangle(ctx, env, O, aO * seg(t, 4.8, 5.4), 2700); names(ctx, env, O, aO * seg(t, 5.2, 5.6), s);
    const [RA, RB, RC] = [TA, TB, TC].map((p) => R(env, p));
    // S2: AA
    const k2 = a * win(t, 10.8, 27.8);
    if (k2 > 0) {
      Ink.path(ctx, [RB, lerpP(RB, RC, seg(t, 11.4, 12.2))], { w: 4, alpha: k2, seed: 2710, taper: [0, 0] });
      angMark(ctx, RB, RC, RA, 40, k2 * seg(t, 12.4, 12.8), 2711); angMark(ctx, RC, RA, RB, 40, k2 * seg(t, 12.8, 13.2), 2712);
      const kk = seg(t, 13.4, 14.6); Ink.path(ctx, [RB, lerpP(RB, RA, kk)], { w: 4, alpha: k2, seed: 2713, taper: [0, 0] }); Ink.path(ctx, [RC, lerpP(RC, RA, kk)], { w: 4, alpha: k2, seed: 2714, taper: [0, 0] });
      angMark(ctx, O[1], O[2], O[0], 30, k2 * seg(t, 12.4, 12.8), 2715); angMark(ctx, O[2], O[0], O[1], 30, k2 * seg(t, 12.8, 13.2), 2716);
      names(ctx, env, [RA, RB, RC], k2 * seg(t, 14.8, 15.2), s, '′');
      shrinkTest(ctx, env, [TA, TB, TC], K, t, 17.0, k2, true, 2717);
    }
    tally(ctx, env, t, [[11.4, 27.8, 'B′ = B, C′ = C'], [13.0, 27.8, 'Üçüncü açı kendiliğinden eşit (180°)'], [15.4, 27.8, 'Kenarlar 1,5 katı'], [19.4, 27.8, 'AA: benzer üçgen ✓', true]]);
    // S3: proportional SSS then SAS
    const k3 = a * win(t, 28.8, 36.8);
    if (k3 > 0) {
      Ink.path(ctx, [RB, lerpP(RB, RC, seg(t, 29.2, 29.8))], { w: 4, alpha: k3, seed: 2720, taper: [0, 0] });
      const rAB = Math.hypot(RA[0] - RB[0], RA[1] - RB[1]), rAC = Math.hypot(RA[0] - RC[0], RA[1] - RC[1]);
      const uB = Math.atan2(RA[1] - RB[1], RA[0] - RB[0]), uC = Math.atan2(RA[1] - RC[1], RA[0] - RC[0]);
      arcAt(ctx, RB, rAB, uB - 0.35, uB - 0.35 + 0.7 * seg(t, 30.0, 30.8), k3, 2721, LI.AMBER_RGB); arcAt(ctx, RC, rAC, uC + 0.35, uC + 0.35 - 0.7 * seg(t, 30.8, 31.6), k3, 2722, LI.AMBER_RGB);
      const kk = seg(t, 31.8, 32.6); Ink.path(ctx, [RB, lerpP(RB, RA, kk)], { w: 4, alpha: k3, seed: 2723, taper: [0, 0] }); Ink.path(ctx, [RC, lerpP(RC, RA, kk)], { w: 4, alpha: k3, seed: 2724, taper: [0, 0] });
      shrinkTest(ctx, env, [TA, TB, TC], K, t, 33.4, k3, true, 2725);
    }
    const k3b = a * win(t, 37.0, 45.8);
    if (k3b > 0) {
      Ink.path(ctx, [RB, lerpP(RB, RC, seg(t, 37.2, 37.8))], { w: 4, alpha: k3b, seed: 2730, taper: [0, 0] });
      angMark(ctx, RB, RC, RA, 40, k3b * seg(t, 38.0, 38.4), 2731);
      Ink.path(ctx, [RB, lerpP(RB, RA, seg(t, 38.6, 39.4))], { w: 4, alpha: k3b, seed: 2732, taper: [0, 0] });
      Ink.path(ctx, [RA, lerpP(RA, RC, seg(t, 39.6, 40.2))], { w: 4, alpha: k3b, seed: 2733, taper: [0, 0], color: LI.AMBER_RGB });
      shrinkTest(ctx, env, [TA, TB, TC], K, t, 40.8, k3b, true, 2734);
    }
    tally(ctx, env, t, [[29.4, 45.8, 'Üç kenar 1,5 katı: KKK ✓'], [37.4, 45.8, 'İki kenar 1,5 katı, aradaki açı eşit: KAK ✓', true], [43.0, 45.8, 'Oran aynı: 1,5']]);
    // S4: not proportional; only one angle
    const k4 = a * win(t, 46.8, 55.0);
    if (k4 > 0) {
      const u = KD.L(env).TW.u, c = KD.L(env).TW.R, ab = 3.77 + 1.5, ac = 4.74 + 1.5, bc = 5.5 + 1.5;
      const xA = (ab * ab - ac * ac + bc * bc) / (2 * bc), yA = Math.sqrt(ab * ab - xA * xA);
      const B_ = [c[0] - bc * u / 2, c[1]], C_ = [c[0] + bc * u / 2, c[1]], A_ = [B_[0] + xA * u, c[1] - yA * u];
      triangle(ctx, env, [A_, B_, C_], k4 * seg(t, 47.2, 48.0), 2740);
      const v = k4 * seg(t, 48.2, 48.6); if (v > 0) { F().T(ctx, '+1,5', (A_[0] + B_[0]) / 2 - 36, (A_[1] + B_[1]) / 2, { size: s * 0.55, alpha: v, halo: true, color: A.amber }); F().T(ctx, '+1,5', (A_[0] + C_[0]) / 2 + 36, (A_[1] + C_[1]) / 2, { size: s * 0.55, alpha: v, halo: true, color: A.amber }); F().T(ctx, '+1,5', c[0], c[1] + 22, { size: s * 0.55, alpha: v, halo: true, color: A.amber }); }
      const pts0 = [A_, B_, C_].map((p) => [(p[0] - c[0]) / u / (bc / 5.5), (p[1] - c[1]) / u / (bc / 5.5)]);
      shrinkTest(ctx, env, pts0, bc / 5.5, t, 50.4, k4, false, 2741);
    }
    const k5 = a * win(t, 55.2, 63.8);
    if (k5 > 0) {
      const c = KD.L(env).TW.R, u = KD.L(env).TW.u, B_ = [c[0] - 3.5 * u, c[1]], C_ = [c[0] + 4.2 * u, c[1]], A_ = [B_[0] + (RA[0] - RB[0]) * 0.9, B_[1] + (RA[1] - RB[1]) * 0.9];
      triangle(ctx, env, [A_, B_, C_], k5 * seg(t, 55.6, 56.4), 2750); angMark(ctx, B_, C_, A_, 40, k5 * seg(t, 56.4, 56.8), 2751);
    }
    tally(ctx, env, t, [[48.0, 55.0, 'Her kenara 1,5 ekledik: oran değil fark ✗'], [56.0, 63.8, 'Yalnızca bir açı eşit: biçim belirlenmiyor ✗'], [58.4, 63.8, 'Açılar eşit ya da kenarlar orantılı olmalı', true]]);
    tally(ctx, env, t, [[65.4, 79.8, 'Yeter: AA · KKK orantılı · KAK orantılı'], [67.4, 79.8, 'Çubuk 2 m, gölgesi 3 m'], [69.2, 79.8, 'Ağacın gölgesi 12 m: 12 ÷ 3 = 4 kat'], [71.0, 79.8, 'Ağaç 2 · 4 = 8 m (AA) ✓', true]]);
  }

  function words(ctx, env, t) {
    const W = KD.L(env).W;
    exprs(ctx, t, at(W, 0), [[5.6, 10.2, 'Varsayım: açılar eşitse biçim aynı olur'],
      [11.4, 27.8, 'Yalnızca iki açıyla çizelim'],
      [29.4, 45.8, 'Kenarları aynı oranla büyütelim'],
      [47.4, 63.8, 'Büyütmek, eklemek değildir'],
      [65.4, 79.8, 'Güneş ışınları aynı açıyla geliyor: benzer üçgenler']]);
    exprs(ctx, t, at(W, 1), [[20.0, 27.8, 'Küçültülen kopya asılla örtüştü'],
      [43.0, 45.8, 'Her kenarın oranı aynı olmalı'],
      [59.0, 63.8, 'Bu üçgenler benzer değil'],
      [74.0, 79.8, 'Ölçemediğimiz yüksekliği benzerlikle bulduk']]);
    exprs(ctx, t, at(W, 2), [[23.0, 27.8, 'İki açı eşitse üçgenler benzer', true], [44.0, 45.8, 'Orantılı kenarlar da yeter', true],
      [61.0, 63.8, 'Oran ve açı önemli', true], [76.0, 79.8, 'Benzerlik: aynı biçim, farklı boyut', true]]);
  }

  function summary(ctx, env, t) {
    if (t < 80.4) return;
    const S = KD.L(env).SUM, f = F(), a = END(t);
    [['İki açı eşit: AA', 80.6], ['Üç kenar orantılı: KKK', 81.6], ['İki kenar orantılı, aradaki açı eşit: KAK', 82.6], ['Aynı biçim, farklı boyut: benzer!', 83.6, true]].forEach(([s, t0, hot], i) => {
      const al = seg(t, t0, t0 + 0.4) * a; if (al <= 0) return;
      f.expr(ctx, [s], S.x, S.y[i], S.s * (i === 3 ? 1.1 : 1), { alpha: al, w: S.w, halo: true, color: hot ? A.amber : undefined });
    });
  }

  LI.fireworks = function (ctx, env, t) {
    const k = seg(t, 84.4, 86.4);
    if (k <= 0 || t >= 91) return;
    const n = F().nokta(t, env), C = [n.x, n.y - 170];
    [30, 60, 90, 120, 150].forEach((d, i) => {
      const r = 150 + 30 * Math.sin(t * 2 + i);
      A.arc(ctx, C, r, d - 12, d + 12, { p: seg(k, i * 0.12, i * 0.12 + 0.4), alpha: 0.8 * (1 - seg(t, 90.2, 91)), w: 6, seed: 80 + i });
    });
  };

  LI.world = function (ctx, env, t) { context(ctx, env, t); figure(ctx, env, t); words(ctx, env, t); summary(ctx, env, t); };

  function camera(t, env) {
    const L = KD.L(env);
    return LI.Camera.breathe(LI.Camera.track([
      [0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [3.0, KD.cam(env, { x: L.nx, y: env.V ? 380 : 140, zoom: 1.6 })],
      [4.8, KD.cam(env, { zoom: 1 })],
    ], t), t, 0.5);
  }
  function render(ctx, lt, env, t) { F().base(ctx, env, t, camera(t, env), () => LI.world(ctx, env, t)); }
  LI.registerScene({ id: 1, start: 0, end: 10, name: 'Same shape', nameTr: 'Aynı biçim', concept: 'A guess', conceptTr: 'Varsayım', render });
})(window.LI = window.LI || {});
