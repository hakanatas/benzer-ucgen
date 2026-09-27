/* Shared layout + Nokta helpers for "Benzer Üçgen İçin Ne Yeter?". */
(function (LI) {
  'use strict';
  const { clamp } = LI.E;
  LI.KD = {
    /** positions for 16:9 and 9:16 */
    L(env) {
      return env.V
        ? {
          CX: { x: 0, y: -780, s: 42, w: 980 },
          G: { s: 40 }, ST: { x: 0, y: -560, c: 40 }, C: { x: 0, y: -560, R: 160 }, GR: { x: -240, y: -330, u: 24 }, TRI: { bx: -330, cx: 330, y: -390, ay: -710 }, STK: { x: 0, y: -380, u: 58 }, TW: { L: [-280, -430], R: [230, -430], u: 38 }, ROW: { x: 0, y: -360 }, RV: { rect: [-330, -590, 36], par: [60, -590, 36], circ: [0, -390, 50] }, TL: { x: 0, y: [-265, -218, -171, -124], s: 38 }, PN: { x: 0, y0: -330, dy: 60 }, EX: { y: -600 }, NL: { x0: -400, x1: 400, y: -380 },
          W: { x: 0, y: [-40, 40, 120], s: 42, w: 980 },
          SUM: { x: 0, y: [-240, -150, -60, 40], s: 42, w: 980 },
          nx: -360, gy: 560, s: 1.15 }
        : {
          CX: { x: 60, y: -445, s: 48, w: 1300 },
          G: { s: 44 }, ST: { x: -380, y: -150, c: 40 }, C: { x: -380, y: -140, R: 185 }, GR: { x: -600, y: 50, u: 34 }, TRI: { bx: -420, cx: 260, y: 35, ay: -340 }, STK: { x: -170, y: -10, u: 62 }, TW: { L: [-470, -90], R: [150, -90], u: 44 }, ROW: { x: 330, y: -225 }, RV: { rect: [-640, -40, 44], par: [-240, -40, 44], circ: [360, -140, 60] }, TL: { x: 600, y: [-380, -318, -256, -194], s: 40 }, PN: { x: 560, y0: -330, dy: 60 }, EX: { y: -290 }, NL: { x0: -220, x1: 640, y: -60 },
          W: { x: 110, y: [128, 196, 262], s: 46, w: 1250 },
          SUM: { x: 110, y: [10, 90, 170, 250], s: 48, w: 1250 },
          nx: -800, gy: 262, s: 1.15 };
    },
    cam(env, o = {}) { return Object.assign({ x: env.V ? 0 : -60, y: env.V ? 60 : 0, zoom: 1, rot: 0, tilt: 1 }, o); },
    /** pupils + face toward a world point */
    look(p, target) {
      const e = LI.Nokta.eyes(p)[0];
      const dx = target[0] - e[0], dy = target[1] - e[1], d = Math.hypot(dx, dy) || 1;
      p.lookX = clamp(dx / d * 1.1, -1, 1); p.lookY = clamp(dy / d * 1.1, -1, 1);
      p.turn = clamp(dx / 900, -0.5, 0.5);
      return p;
    },
    /** a short ground stroke under Nokta */
    ground(ctx, env, x, gy) { LI.Ambient.ground(ctx, x - 360, x + 360, gy + 6, { alpha: 0.32 }); },
  };
})(window.LI = window.LI || {});
