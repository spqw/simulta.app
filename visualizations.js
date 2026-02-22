// ── Simulta Landing Page Visualizations ──
// Animated canvas visualizations for hero, file tree, orchestration graph, and scale section

(function () {
  'use strict';

  const COLORS = {
    bg: '#08080a',
    bgSubtle: '#0e0e12',
    border: '#25252d',
    primary: '#7c5cfc',
    primaryGlow: 'rgba(124, 92, 252, 0.3)',
    green: '#22c55e',
    orange: '#f97316',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    red: '#ef4444',
    text: '#f0f0f5',
    textMuted: '#606070',
    textSecondary: '#9898a8',
  };

  // ── Utility ──
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(min, max) { return Math.random() * (max - min) + min; }

  // ── 1. Hero Canvas — Particle Network ──
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = (rect.width * 500 / 700) * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = (rect.width * 500 / 700) + 'px';
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width / (window.devicePixelRatio || 1);
    const H = () => canvas.height / (window.devicePixelRatio || 1);

    // Agent nodes
    const agents = [];
    const AGENT_COUNT = 30;
    const agentNames = ['Auth', 'API', 'Tests', 'Deploy', 'Docs', 'UI', 'DB', 'Cache', 'Search', 'Queue', 'ML', 'Logs', 'CI', 'Monitor', 'Config'];

    for (let i = 0; i < AGENT_COUNT; i++) {
      agents.push({
        x: rand(40, 660),
        y: rand(40, 460),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        r: rand(3, 7),
        color: [COLORS.primary, COLORS.green, COLORS.blue, COLORS.cyan, COLORS.orange][i % 5],
        name: agentNames[i % agentNames.length],
        active: Math.random() > 0.3,
        pulsePhase: rand(0, Math.PI * 2),
      });
    }

    // Connection lines
    function drawConnections() {
      for (let i = 0; i < agents.length; i++) {
        for (let j = i + 1; j < agents.length; j++) {
          const dx = agents[i].x - agents[j].x;
          const dy = agents[i].y - agents[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(agents[i].x, agents[i].y);
            ctx.lineTo(agents[j].x, agents[j].y);
            ctx.strokeStyle = `rgba(124, 92, 252, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // Data packets traveling along connections
    const packets = [];
    setInterval(() => {
      if (packets.length < 8) {
        const from = agents[Math.floor(rand(0, agents.length))];
        const to = agents[Math.floor(rand(0, agents.length))];
        if (from !== to) {
          packets.push({ from, to, t: 0, speed: rand(0.005, 0.015), color: from.color });
        }
      }
    }, 400);

    function drawPackets(time) {
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed;
        if (p.t >= 1) { packets.splice(i, 1); continue; }
        const x = lerp(p.from.x, p.to.x, p.t);
        const y = lerp(p.from.y, p.to.y, p.t);
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', ', 0.2)').replace('rgb', 'rgba');
        ctx.fill();
      }
    }

    let time = 0;
    function animate() {
      time += 0.016;
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // Update positions
      for (const a of agents) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 20 || a.x > w - 20) a.vx *= -1;
        if (a.y < 20 || a.y > h - 20) a.vy *= -1;
        a.x = Math.max(20, Math.min(w - 20, a.x));
        a.y = Math.max(20, Math.min(h - 20, a.y));
      }

      drawConnections();
      drawPackets(time);

      // Draw agents
      for (const a of agents) {
        const pulse = Math.sin(time * 2 + a.pulsePhase) * 0.3 + 0.7;

        // Glow
        if (a.active) {
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r * 3, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.r * 3);
          grad.addColorStop(0, a.color.replace(')', `, ${0.15 * pulse})`).replace('rgb', 'rgba').replace('#', ''));
          grad.addColorStop(1, 'transparent');
          // Simpler approach for hex colors
          ctx.fillStyle = `rgba(124, 92, 252, ${0.08 * pulse})`;
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = a.active ? a.color : COLORS.border;
        ctx.fill();

        // Ring for active
        if (a.active) {
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r + 3, 0, Math.PI * 2 * pulse);
          ctx.strokeStyle = a.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.4;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ── 2. File Tree Canvas ──
  function initFileTreeCanvas() {
    const canvas = document.getElementById('fileTreeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 280 * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = '280px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width / (window.devicePixelRatio || 1);

    const files = [
      { name: 'src/', depth: 0, type: 'dir' },
      { name: 'auth/', depth: 1, type: 'dir' },
      { name: 'middleware.ts', depth: 2, type: 'modified', progress: 0 },
      { name: 'jwt.ts', depth: 2, type: 'added', progress: 0 },
      { name: 'routes.ts', depth: 2, type: 'modified', progress: 0 },
      { name: 'api/', depth: 1, type: 'dir' },
      { name: 'users.ts', depth: 2, type: 'file', progress: 0 },
      { name: 'products.ts', depth: 2, type: 'modified', progress: 0 },
      { name: 'utils/', depth: 1, type: 'dir' },
      { name: 'crypto.ts', depth: 2, type: 'added', progress: 0 },
      { name: 'tests/', depth: 0, type: 'dir' },
      { name: 'auth.test.ts', depth: 1, type: 'added', progress: 0 },
      { name: 'api.test.ts', depth: 1, type: 'file', progress: 0 },
    ];

    let revealIndex = 0;
    let time = 0;

    setInterval(() => {
      if (revealIndex < files.length) revealIndex++;
    }, 600);

    function animate() {
      time += 0.016;
      const w = W();
      ctx.clearRect(0, 0, w, 280);

      const lineH = 21;
      const startY = 8;

      for (let i = 0; i < Math.min(revealIndex, files.length); i++) {
        const f = files[i];
        const x = 16 + f.depth * 18;
        const y = startY + i * lineH;

        // Animate progress
        f.progress = Math.min(f.progress + 0.05, 1);
        ctx.globalAlpha = f.progress;

        // Icon
        if (f.type === 'dir') {
          ctx.fillStyle = COLORS.primary;
          ctx.font = '11px SF Mono, monospace';
          ctx.fillText('▸', x, y + 12);
          ctx.fillStyle = COLORS.text;
          ctx.font = 'bold 11px SF Mono, monospace';
          ctx.fillText(f.name, x + 14, y + 12);
        } else {
          let color = COLORS.textMuted;
          let badge = '';
          if (f.type === 'modified') { color = COLORS.orange; badge = 'M'; }
          if (f.type === 'added') { color = COLORS.green; badge = 'A'; }

          ctx.fillStyle = COLORS.textSecondary;
          ctx.font = '11px SF Mono, monospace';
          ctx.fillText(f.name, x + 14, y + 12);

          if (badge) {
            ctx.fillStyle = color;
            ctx.font = 'bold 9px SF Mono, monospace';
            ctx.fillText(badge, w - 30, y + 12);

            // Glow on recent
            if (f.progress < 0.8) {
              ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
              ctx.fillRect(x, y, w - x - 16, lineH);
              ctx.fillStyle = color;
            }
          }
        }

        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ── 3. Test Viz (DOM-based) ──
  function initTestViz() {
    const container = document.getElementById('testViz');
    if (!container) return;

    const tests = [
      { name: 'auth.login', status: 'pass', width: 95 },
      { name: 'auth.register', status: 'pass', width: 88 },
      { name: 'auth.jwt.sign', status: 'pass', width: 100 },
      { name: 'auth.jwt.verify', status: 'pass', width: 92 },
      { name: 'auth.refresh', status: 'running', width: 60 },
      { name: 'api.users.list', status: 'pass', width: 85 },
      { name: 'api.users.create', status: 'pass', width: 90 },
      { name: 'api.products', status: 'fail', width: 45 },
      { name: 'utils.crypto', status: 'pass', width: 100 },
      { name: 'e2e.checkout', status: 'running', width: 30 },
    ];

    container.innerHTML = '';

    tests.forEach((test, i) => {
      const row = document.createElement('div');
      row.className = 'test-row';
      row.innerHTML = `
        <span class="test-name">${test.name}</span>
        <div class="test-bar-bg">
          <div class="test-bar ${test.status}" style="width: 0%"></div>
        </div>
        <span class="test-status ${test.status}">${test.status === 'pass' ? 'PASS' : test.status === 'fail' ? 'FAIL' : '...'}</span>
      `;
      container.appendChild(row);

      // Animate width
      setTimeout(() => {
        const bar = row.querySelector('.test-bar');
        bar.style.width = test.width + '%';
      }, 200 + i * 150);
    });

    // Animate running tests
    setInterval(() => {
      const runningBars = container.querySelectorAll('.test-bar.running');
      runningBars.forEach(bar => {
        const current = parseInt(bar.style.width) || 30;
        const next = current + Math.floor(rand(2, 8));
        if (next >= 100) {
          bar.style.width = '100%';
          bar.className = 'test-bar pass';
          bar.parentElement.nextElementSibling.textContent = 'PASS';
          bar.parentElement.nextElementSibling.className = 'test-status pass';
        } else {
          bar.style.width = next + '%';
        }
      });
    }, 800);
  }

  // ── 4. Orchestration Canvas ──
  function initOrchestrationCanvas() {
    const canvas = document.getElementById('orchestrationCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const aspect = 320 / 840;
      canvas.width = rect.width * dpr;
      canvas.height = rect.width * aspect * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = (rect.width * aspect) + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width / (window.devicePixelRatio || 1);
    const H = () => canvas.height / (window.devicePixelRatio || 1);

    // Pipeline nodes
    const stages = [
      { id: 'plan', label: 'Plan', x: 0.08, y: 0.5, color: COLORS.primary, status: 'done' },
      { id: 'code1', label: 'Code (Auth)', x: 0.26, y: 0.25, color: COLORS.blue, status: 'done' },
      { id: 'code2', label: 'Code (API)', x: 0.26, y: 0.75, color: COLORS.blue, status: 'running' },
      { id: 'test', label: 'Test Suite', x: 0.48, y: 0.25, color: COLORS.green, status: 'running' },
      { id: 'review', label: 'Code Review', x: 0.48, y: 0.75, color: COLORS.orange, status: 'waiting' },
      { id: 'merge', label: 'Merge', x: 0.68, y: 0.5, color: COLORS.cyan, status: 'waiting' },
      { id: 'deploy', label: 'Deploy', x: 0.88, y: 0.5, color: COLORS.green, status: 'waiting' },
    ];

    const edges = [
      ['plan', 'code1'], ['plan', 'code2'],
      ['code1', 'test'], ['code2', 'review'],
      ['test', 'merge'], ['review', 'merge'],
      ['merge', 'deploy'],
    ];

    const dataFlows = [];

    setInterval(() => {
      if (dataFlows.length < 4) {
        const edge = edges[Math.floor(rand(0, edges.length))];
        const from = stages.find(s => s.id === edge[0]);
        const to = stages.find(s => s.id === edge[1]);
        if (from && to) {
          dataFlows.push({ from, to, t: 0, speed: rand(0.008, 0.018) });
        }
      }
    }, 500);

    let time = 0;

    function animate() {
      time += 0.016;
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // Draw edges
      for (const [fromId, toId] of edges) {
        const from = stages.find(s => s.id === fromId);
        const to = stages.find(s => s.id === toId);
        const fx = from.x * w, fy = from.y * h;
        const tx = to.x * w, ty = to.y * h;

        ctx.beginPath();
        // Bezier curve
        const cx1 = fx + (tx - fx) * 0.5;
        const cx2 = fx + (tx - fx) * 0.5;
        ctx.moveTo(fx, fy);
        ctx.bezierCurveTo(cx1, fy, cx2, ty, tx, ty);
        ctx.strokeStyle = 'rgba(37, 37, 45, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw data flows
      for (let i = dataFlows.length - 1; i >= 0; i--) {
        const df = dataFlows[i];
        df.t += df.speed;
        if (df.t >= 1) { dataFlows.splice(i, 1); continue; }

        const fx = df.from.x * w, fy = df.from.y * h;
        const tx = df.to.x * w, ty = df.to.y * h;
        const cx1 = fx + (tx - fx) * 0.5;
        const cx2 = fx + (tx - fx) * 0.5;

        // Compute bezier point
        const t = df.t;
        const mt = 1 - t;
        const px = mt * mt * mt * fx + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * tx;
        const py = mt * mt * mt * fy + 3 * mt * mt * t * fy + 3 * mt * t * t * ty + t * t * t * ty;

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.primary;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 92, 252, 0.15)';
        ctx.fill();
      }

      // Draw nodes
      for (const s of stages) {
        const x = s.x * w;
        const y = s.y * h;
        const nodeR = 28;

        // Background circle
        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = '#12121a';
        ctx.fill();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Status ring animation for running
        if (s.status === 'running') {
          ctx.beginPath();
          const startAngle = time * 2;
          ctx.arc(x, y, nodeR + 5, startAngle, startAngle + Math.PI * 1.2);
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Checkmark for done
        if (s.status === 'done') {
          ctx.fillStyle = s.color;
          ctx.font = 'bold 14px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', x, y);
        } else if (s.status === 'running') {
          ctx.fillStyle = s.color;
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⟳', x, y);
        } else {
          ctx.fillStyle = COLORS.textMuted;
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('○', x, y);
        }

        // Label
        ctx.fillStyle = COLORS.textSecondary;
        ctx.font = '500 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(s.label, x, y + nodeR + 8);
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ── 5. Scale Canvas — Many agent dots ──
  function initScaleCanvas() {
    const canvas = document.getElementById('scaleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = (rect.width * 380 / 480) * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = (rect.width * 380 / 480) + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width / (window.devicePixelRatio || 1);
    const H = () => canvas.height / (window.devicePixelRatio || 1);

    // Grid of agents
    const dots = [];
    const COLS = 10;
    const ROWS = 5;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        dots.push({
          col, row,
          active: Math.random() > 0.1,
          color: [COLORS.primary, COLORS.green, COLORS.blue, COLORS.cyan, COLORS.orange][Math.floor(rand(0, 5))],
          pulsePhase: rand(0, Math.PI * 2),
          progress: rand(0.2, 1),
        });
      }
    }

    let time = 0;

    function animate() {
      time += 0.016;
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      const cellW = (w - 60) / COLS;
      const cellH = (h - 60) / ROWS;
      const startX = 30;
      const startY = 30;

      for (const d of dots) {
        const cx = startX + d.col * cellW + cellW / 2;
        const cy = startY + d.row * cellH + cellH / 2;
        const r = Math.min(cellW, cellH) * 0.35;
        const pulse = Math.sin(time * 1.5 + d.pulsePhase) * 0.15 + 0.85;

        // Background rect
        ctx.beginPath();
        const rr = r * 1.6;
        ctx.roundRect(cx - rr, cy - rr, rr * 2, rr * 2, 6);
        ctx.fillStyle = d.active ? 'rgba(124, 92, 252, 0.04)' : 'rgba(37, 37, 45, 0.3)';
        ctx.fill();
        ctx.strokeStyle = d.active ? 'rgba(124, 92, 252, 0.15)' : 'rgba(37, 37, 45, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (d.active) {
          // Progress arc
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * d.progress);
          ctx.strokeStyle = d.color;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.lineCap = 'butt';

          // Center dot
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = d.color;
          ctx.globalAlpha = pulse;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Update progress
          d.progress += 0.001;
          if (d.progress > 1) d.progress = rand(0.1, 0.3);
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.border;
          ctx.fill();
        }
      }

      // Connection lines between adjacent active dots
      for (const d of dots) {
        if (!d.active) continue;
        const cx = startX + d.col * cellW + cellW / 2;
        const cy = startY + d.row * cellH + cellH / 2;

        // Right neighbor
        const right = dots.find(dd => dd.col === d.col + 1 && dd.row === d.row && dd.active);
        if (right) {
          const rx = startX + right.col * cellW + cellW / 2;
          const ry = startY + right.row * cellH + cellH / 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.min(cellW, cellH) * 0.35 * 1.6, cy);
          ctx.lineTo(rx - Math.min(cellW, cellH) * 0.35 * 1.6, ry);
          ctx.strokeStyle = 'rgba(124, 92, 252, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Bottom neighbor
        const bottom = dots.find(dd => dd.col === d.col && dd.row === d.row + 1 && dd.active);
        if (bottom) {
          const bx = startX + bottom.col * cellW + cellW / 2;
          const by = startY + bottom.row * cellH + cellH / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy + Math.min(cellW, cellH) * 0.35 * 1.6);
          ctx.lineTo(bx, by - Math.min(cellW, cellH) * 0.35 * 1.6);
          ctx.strokeStyle = 'rgba(124, 92, 252, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // ── Intersection Observer for lazy init ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (id === 'fileTreeCanvas') initFileTreeCanvas();
        if (id === 'testViz') initTestViz();
        if (id === 'orchestrationCanvas') initOrchestrationCanvas();
        if (id === 'scaleCanvas') initScaleCanvas();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Init hero immediately, others on scroll
  document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();

    const lazyTargets = ['fileTreeCanvas', 'testViz', 'orchestrationCanvas', 'scaleCanvas'];
    lazyTargets.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  });

})();
