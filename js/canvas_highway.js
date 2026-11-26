import { RIBOSOME_FOOTPRINT } from './physics.js';
import { t } from './i18n.js';

function speedToColor(rate, meanRate) {
  const ratio = rate / Math.max(1, meanRate);
  if (ratio >= 0.85) return '#0E7C7B'; // fast teal
  if (ratio >= 0.52) return '#D97706'; // moderate / folding pause amber
  return '#DC2626'; // severe bottleneck crimson
}

export class HighwayCanvas {
  constructor(canvas, tooltipEl, onSelectCodon) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tooltipEl = tooltipEl;
    this.onSelectCodon = onSelectCodon;
    this.hoverIdx = -1;
    this.selectedIdx = -1;
    this.pulsePhase = 0;

    this.state = {
      kinetics: [],
      steady: null,
      sim: null,
      domains: []
    };

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const idx = this._hitTestCodon(e);
      if (idx !== this.hoverIdx) {
        this.hoverIdx = idx;
      }
      this._updateTooltip(e, idx);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverIdx = -1;
      this.tooltipEl.classList.add('hidden');
    });

    this.canvas.addEventListener('click', (e) => {
      const idx = this._hitTestCodon(e);
      if (idx >= 0 && this.onSelectCodon) {
        this.selectedIdx = idx;
        this.onSelectCodon(idx);
      }
    });
  }

  _getLayout() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 900;
    const h = rect.height || 260;
    const padL = 56;
    const padR = 30;
    const trackW = Math.max(100, w - padL - padR);
    const backboneY = Math.round(h * 0.67);
    return { w, h, padL, padR, trackW, backboneY };
  }

  _hitTestCodon(e) {
    const { kinetics } = this.state;
    if (!kinetics.length) return -1;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { padL, trackW } = this._getLayout();
    const rel = (x - padL) / trackW;
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

  setData({ kinetics, steady, sim, domains, selectedIdx }) {
    this.state = { kinetics, steady, sim, domains };
    if (typeof selectedIdx === 'number') this.selectedIdx = selectedIdx;
  }

  render(dtSec = 0.016) {
    this.pulsePhase += dtSec * 4.5;
    const dpr = window.devicePixelRatio || 1;
    const { w, h, padL, trackW, backboneY } = this._getLayout();

    if (this.canvas.width !== Math.round(w * dpr) || this.canvas.height !== Math.round(h * dpr)) {
      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(dpr, dpr);

    // Deep obsidian stage background
    ctx.fillStyle = '#0F171E';
    ctx.fillRect(0, 0, w, h);

    // Subtle molecular grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let y = 32; y < h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + trackW, y);
      ctx.stroke();
    }

    const { kinetics, steady, sim, domains } = this.state;
    const N = kinetics.length;
    if (!N) {
      ctx.restore();
      return;
    }

    const codonW = trackW / N;
    const meanRate = steady ? steady.geneMeanRate : 6.0;

    // 1. Highlight +30 aa co-translational folding windows
    if (steady && steady.foldingWindows) {
      for (const fw of steady.foldingWindows) {
        const x1 = padL + fw.startIdx * codonW;
        const x2 = padL + (fw.endIdx + 1) * codonW;
        ctx.fillStyle = 'rgba(217, 119, 6, 0.14)';
        ctx.fillRect(x1, 28, x2 - x1, backboneY - 22);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x1, 28, x2 - x1, backboneY - 22);
        ctx.setLineDash([]);

        ctx.fillStyle = '#FBBF24';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${fw.domainName} +30aa`, (x1 + x2) / 2, 21);
      }
    }

    // 2. Domain color bars below the mRNA backbone
    for (const dom of domains) {
      const dx1 = padL + (dom.start - 1) * codonW;
      const dx2 = padL + dom.end * codonW;
      ctx.fillStyle = dom.color || '#0E7C7B';
      ctx.globalAlpha = 0.78;
      ctx.fillRect(dx1, backboneY + 14, Math.max(4, dx2 - dx1), 6);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 10px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(dom.name, dx1 + 2, backboneY + 32);
    }

    // 3. Codon ruler ticks & labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const stepTick = N > 140 ? 20 : 10;
    for (let i = 0; i < N; i += stepTick) {
      const tx = padL + (i + 0.5) * codonW;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.fillRect(tx, backboneY + 6, 1, 5);
      ctx.fillStyle = '#64748B';
      ctx.fillText(String(i + 1), tx, h - 10);
    }

    // 4. mRNA Strand colored per-codon by effective decoding speed
    for (let i = 0; i < N; i++) {
      const x = padL + i * codonW;
      const col = speedToColor(kinetics[i].effectiveRate, meanRate);
      ctx.fillStyle = col;
      ctx.fillRect(x, backboneY - 3, Math.max(1.2, codonW - 0.5), 6);
    }

    // Highlight selected or hovered codon
    const highlightIdx = this.hoverIdx >= 0 ? this.hoverIdx : this.selectedIdx;
    if (highlightIdx >= 0 && highlightIdx < N) {
      const hx = padL + highlightIdx * codonW;
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hx - 1, backboneY - 9, Math.max(4, codonW + 2), 18);
    }

    // 5. Draw Ribosomes (sorted 5' -> 3' visually) & Disome Collision Effects
    if (sim && sim.ribosomes) {
      const ribos = [...sim.ribosomes].sort((a, b) => a.visualPos - b.visualPos);
      const footprintPx = Math.max(24, RIBOSOME_FOOTPRINT * codonW);

      for (let rIdx = 0; rIdx < ribos.length; rIdx++) {
        const ribo = ribos[rIdx];
        const aSiteX = padL + (ribo.visualPos + 0.5) * codonW;
        // Ribosome body spans roughly [-6, +4] around A-site
        const centerX = aSiteX - codonW * 1.0;
        const bodyW = footprintPx * 0.92;
        const collided = ribo.collided;

        // Disome collision shockwave & bumper between collided trailing and leading ribosome
        if (collided) {
          const pulse = 0.5 + 0.5 * Math.sin(this.pulsePhase * 2.2);
          const impactX = centerX + bodyW * 0.52;
          ctx.save();
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.45 + pulse * 0.45})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(impactX, backboneY - 14, 10 + pulse * 9, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#DC2626';
          ctx.font = '700 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(t('disomeBadge'), centerX, backboneY - 58);
          ctx.restore();
        }

        // Nascent polypeptide chain emerging upward from exit tunnel
        const chainLen = Math.min(54, 10 + (ribo.visualPos / N) * 44);
        ctx.save();
        ctx.strokeStyle = collided ? '#FCA5A5' : '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const tunnelX = centerX - bodyW * 0.14;
        const tunnelTopY = backboneY - 30;
        ctx.moveTo(tunnelX, tunnelTopY);
        for (let seg = 1; seg <= 6; seg++) {
          const sy = tunnelTopY - (chainLen * seg) / 6;
          const sx = tunnelX + Math.sin(this.pulsePhase * 0.6 + ribo.id + seg * 1.1) * 4.5;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Folded nascent domain globules when ribosome passes domain.end + 30
        for (let dIdx = 0; dIdx < domains.length; dIdx++) {
          const dom = domains[dIdx];
          if (ribo.pos >= dom.end + 28) {
            const globY = tunnelTopY - chainLen * (0.45 + dIdx * 0.25);
            const globX = tunnelX + (dIdx % 2 === 0 ? -5 : 5);
            ctx.fillStyle = dom.color || '#14B8A6';
            ctx.beginPath();
            ctx.arc(globX, globY, 5.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#0F171E';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        ctx.restore();

        // Small 40S/30S subunit (bottom)
        ctx.save();
        ctx.fillStyle = collided ? '#991B1B' : '#1E293B';
        ctx.strokeStyle = collided ? '#F87171' : '#38BDF8';
        ctx.lineWidth = 1.4;
        this._roundRect(
          ctx,
          centerX - bodyW * 0.44,
          backboneY - 6,
          bodyW * 0.88,
          14,
          6
        );
        ctx.fill();
        ctx.stroke();

        // Large 60S/50S subunit (dome)
        const grad = ctx.createLinearGradient(0, backboneY - 34, 0, backboneY - 6);
        if (collided) {
          grad.addColorStop(0, '#EF4444');
          grad.addColorStop(1, '#991B1B');
        } else {
          grad.addColorStop(0, '#14B8A6');
          grad.addColorStop(1, '#0F5257');
        }
        ctx.fillStyle = grad;
        ctx.strokeStyle = collided ? '#FCA5A5' : '#5EEAD4';
        ctx.lineWidth = 1.4;
        this._roundRect(
          ctx,
          centerX - bodyW * 0.48,
          backboneY - 32,
          bodyW * 0.96,
          25,
          11
        );
        ctx.fill();
        ctx.stroke();

        // A-site decoding needle marker
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(aSiteX - 0.75, backboneY - 8, 1.5, 11);
        ctx.restore();
      }
    }

    // 5' and 3' terminal labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText("5'", padL - 10, backboneY + 4);
    ctx.textAlign = 'left';
    ctx.fillText("3'", padL + trackW + 8, backboneY + 4);

    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }
}
