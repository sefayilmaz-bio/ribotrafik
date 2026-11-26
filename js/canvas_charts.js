import { t } from './i18n.js';

export class BioChartsCanvas {
  constructor(canvas, tooltipEl, onSelectCodon) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tooltipEl = tooltipEl;
    this.onSelectCodon = onSelectCodon;
    this.hoverIdx = -1;
    this.selectedIdx = -1;
    this.state = {
      kinetics: [],
      steady: null,
      domains: []
    };
    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const idx = this._hitTestCodon(e);
      if (idx !== this.hoverIdx) {
        this.hoverIdx = idx;
        this.render();
      }
      this._updateTooltip(e, idx);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIdx = -1;
      this.tooltipEl.classList.add('hidden');
      this.render();
    });

    this.canvas.addEventListener('click', (e) => {
      const idx = this._hitTestCodon(e);
      if (idx >= 0 && this.onSelectCodon) {
        this.selectedIdx = idx;
        this.onSelectCodon(idx);
        this.render();
      }
    });
  }

  _getLayout() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 310;
    const padL = 50;
    const padR = 24;
    const plotW = Math.max(100, w - padL - padR);
    return { w, h, padL, padR, plotW };
  }

  _hitTestCodon(e) {
    const { kinetics } = this.state;
    if (!kinetics.length) return -1;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { padL, plotW } = this._getLayout();
    const rel = (x - padL) / plotW;
    if (rel < 0 || rel > 1) return -1;
    return Math.max(0, Math.min(kinetics.length - 1, Math.floor(rel * kinetics.length)));
  }

  _updateTooltip(e, idx) {
    const { kinetics, steady } = this.state;
    if (idx < 0 || !kinetics[idx]) {
      this.tooltipEl.classList.add('hidden');
      return;
    }
    const k = kinetics[idx];
    const occ = steady ? Math.round((steady.occupancy[idx] || 0) * 100) : 0;
    const coll = steady ? Math.round((steady.collisionRate[idx] || 0) * 100) : 0;

    this.tooltipEl.innerHTML = `
      <div class="tt-title">${t('tooltipCodon', { pos: idx + 1, aa: k.aa, codon: k.codon })}</div>
      <div class="tt-row">${t('tooltipRate', { rate: k.effectiveRate.toFixed(1), base: k.baseRate.toFixed(1) })}</div>
      <div class="tt-row">${t('tooltipOcc', { occ, coll })}</div>
    `;
    const parentRect = this.canvas.parentElement.getBoundingClientRect();
    const tx = Math.min(parentRect.width - 220, Math.max(12, e.clientX - parentRect.left + 12));
    const ty = Math.max(8, e.clientY - parentRect.top - 64);
    this.tooltipEl.style.left = `${tx}px`;
    this.tooltipEl.style.top = `${ty}px`;
    this.tooltipEl.classList.remove('hidden');
  }

  setData({ kinetics, steady, domains, selectedIdx }) {
    this.state = { kinetics, steady, domains };
    if (typeof selectedIdx === 'number') this.selectedIdx = selectedIdx;
    this.render();
  }

  render() {
    const dpr = window.devicePixelRatio || 1;
    const { w, h, padL, plotW } = this._getLayout();

    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const { kinetics, steady, domains } = this.state;
    const N = kinetics.length;
    if (!N || !steady) {
      ctx.restore();
      return;
    }

    const stepX = plotW / N;

    // Track geometries
    const tATop = 16;
    const tABot = 114;
    const tBTop = 136;
    const tBBot = 232;
    const tCTop = 250;

    // Folding window vertical background bands across Track A & B
    for (const fw of steady.foldingWindows) {
      const fx1 = padL + fw.startIdx * stepX;
      const fx2 = padL + (fw.endIdx + 1) * stepX;
      ctx.fillStyle = 'rgba(217, 119, 6, 0.11)';
      ctx.fillRect(fx1, tATop, fx2 - fx1, tBBot - tATop);
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(fx1, tATop, fx2 - fx1, tBBot - tATop);
    }

    // --- TRACK A: Ribo-Seq Occupancy + Disome Collision ---
    this._drawAxisBox(ctx, padL, tATop, plotW, tABot - tATop, 'Ribo-Seq');
    const maxOcc = Math.max(0.35, ...steady.occupancy) * 1.1;

    // Occupancy area
    ctx.beginPath();
    ctx.moveTo(padL, tABot);
    for (let i = 0; i < N; i++) {
      const x = padL + (i + 0.5) * stepX;
      const y = tABot - (steady.occupancy[i] / maxOcc) * (tABot - tATop - 8);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(padL + plotW, tABot);
    ctx.closePath();
    ctx.fillStyle = 'rgba(14, 124, 123, 0.22)';
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (i + 0.5) * stepX;
      const y = tABot - (steady.occupancy[i] / maxOcc) * (tABot - tATop - 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#0E7C7B';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Disome Collision bars
    ctx.fillStyle = 'rgba(220, 38, 38, 0.78)';
    for (let i = 0; i < N; i++) {
      const c = steady.collisionRate[i];
      if (c > 0.004) {
        const x = padL + i * stepX;
        const barH = Math.min(tABot - tATop - 4, (c / maxOcc) * (tABot - tATop - 8));
        ctx.fillRect(x, tABot - barH, Math.max(2, stepX - 0.5), barH);
      }
    }

    // --- TRACK B: Effective Speed k_i & AA Stall Ticks ---
    this._drawAxisBox(ctx, padL, tBTop, plotW, tBBot - tBTop, 'kᵢ (s⁻¹)');
    const maxRate = Math.max(10, ...kinetics.map((k) => k.effectiveRate)) * 1.08;

    // Mean line
    const meanY = tBBot - (steady.geneMeanRate / maxRate) * (tBBot - tBTop - 8);
    ctx.save();
    ctx.strokeStyle = '#94A3B8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, meanY);
    ctx.lineTo(padL + plotW, meanY);
    ctx.stroke();
    ctx.restore();

    // Speed line
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = padL + (i + 0.5) * stepX;
      const y = tBBot - (kinetics[i].effectiveRate / maxRate) * (tBBot - tBTop - 8);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    // Mark PP and +Q stall triggers
    for (let i = 0; i < N; i++) {
      const k = kinetics[i];
      if (k.cause === 'polypro' || k.cause === 'charge') {
        const x = padL + (i + 0.5) * stepX;
        const y = tBBot - (k.effectiveRate / maxRate) * (tBBot - tBTop - 8);
        ctx.fillStyle = k.cause === 'polypro' ? '#7C3AED' : '#EA580C';
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- TRACK C: Domain Map & +30aa Folding Arcs ---
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(padL, tCTop + 12, plotW, 4);

    for (const dom of domains) {
      const dx1 = padL + (dom.start - 1) * stepX;
      const dx2 = padL + dom.end * stepX;
      ctx.fillStyle = dom.color || '#0E7C7B';
      ctx.fillRect(dx1, tCTop + 6, Math.max(6, dx2 - dx1), 16);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 10px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'center';
      if (dx2 - dx1 > 44) {
        ctx.fillText(dom.name, (dx1 + dx2) / 2, tCTop + 18);
      }

      // Curved arrow pointing to +30 aa folding window
      const winCenter = dom.end - 1 + 30;
      if (winCenter < N - 1) {
        const wx = padL + (winCenter + 0.5) * stepX;
        ctx.save();
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.3;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(dx2, tCTop + 6);
        ctx.quadraticCurveTo((dx2 + wx) / 2, tCTop - 10, wx, tBBot + 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Codon axis labels at bottom
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const tickEvery = N > 140 ? 20 : 10;
    for (let i = 0; i < N; i += tickEvery) {
      const tx = padL + (i + 0.5) * stepX;
      ctx.fillText(String(i + 1), tx, h - 8);
    }

    // Crosshair for hover / selected codon
    const activeIdx = this.hoverIdx >= 0 ? this.hoverIdx : this.selectedIdx;
    if (activeIdx >= 0 && activeIdx < N) {
      const cx = padL + (activeIdx + 0.5) * stepX;
      ctx.save();
      ctx.strokeStyle = 'rgba(17, 24, 28, 0.45)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, tATop);
      ctx.lineTo(cx, tBBot);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  _drawAxisBox(ctx, x, y, w, h, label) {
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#475569';
    ctx.font = '600 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(label, x - 6, y + 14);
  }
}
