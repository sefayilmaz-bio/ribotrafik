import { CODON_TO_AA, AA_INFO, ORGANISMS } from './biology.js';

export const RIBOSOME_FOOTPRINT = 10; // L = 10 codons

function isComplement(a, b) {
  return (
    (a === 'A' && b === 'T') ||
    (a === 'T' && b === 'A') ||
    (a === 'G' && b === 'C') ||
    (a === 'C' && b === 'G')
  );
}

/**
 * Computes per-codon effective decoding rate k_i (codons/s) and biophysical factors:
 * k_eff = max(0.25, k_base * f_charge * f_polypro * f_hairpin)
 */
export function computeCodonKinetics(codons, organismId, options = {}) {
  const {
    useChargeDrag = true,
    usePolyPro = true,
    useHairpin = true
  } = options;

  const org = ORGANISMS[organismId] || ORGANISMS.human;
  const n = codons.length;
  const aas = codons.map((c) => CODON_TO_AA[c] || '?');
  const fullNt = codons.join('');

  const rates = [];
  for (let i = 0; i < n; i++) {
    const codon = codons[i];
    const aa = aas[i];
    const isStop = aa === '*';
    const baseRate = org.rates[codon] || 5.0;

    // 1. Nascent peptide electrostatic exit tunnel drag (+K/+R inside 30-aa tunnel)
    let chargeFactor = 1.0;
    let tunnelCharge = 0;
    if (useChargeDrag && !isStop && i > 0) {
      const start = Math.max(0, i - 30);
      for (let j = start; j < i; j++) {
        const q = AA_INFO[aas[j]]?.charge || 0;
        const dist = i - j;
        const weight = dist >= 4 && dist <= 18 ? 1.25 : 0.9;
        tunnelCharge += q * weight;
      }
      if (tunnelCharge > 4.0) {
        chargeFactor = Math.max(0.14, Math.exp(-0.22 * (tunnelCharge - 4.0)));
      }
    }

    // 2. Poly-proline peptidyl-transferase steric stall (PP, PPP, PP[GDW])
    let polyProFactor = 1.0;
    if (usePolyPro && aa === 'P') {
      const prev1 = i >= 1 ? aas[i - 1] : '';
      const prev2 = i >= 2 ? aas[i - 2] : '';
      const next1 = i + 1 < n ? aas[i + 1] : '';
      if (prev1 === 'P' && (prev2 === 'P' || next1 === 'P' || next1 === 'G' || next1 === 'D' || next1 === 'W')) {
        polyProFactor = 0.18;
      } else if (prev1 === 'P') {
        polyProFactor = 0.38;
      }
    }

    // 3. Downstream mRNA secondary structure / GC-rich stem-loop (+9 to +33 nt ahead)
    let hairpinFactor = 1.0;
    if (useHairpin && !isStop && i + 10 < n) {
      const wStart = (i + 3) * 3;
      const wEnd = Math.min(fullNt.length, wStart + 24);
      const win = fullNt.slice(wStart, wEnd);
      if (win.length >= 18) {
        let gcCount = 0;
        for (let k = 0; k < win.length; k++) {
          if (win[k] === 'G' || win[k] === 'C') gcCount++;
        }
        const gcFrac = gcCount / win.length;

        let maxPairs = 0;
        for (let offset = 0; offset <= win.length - 12; offset++) {
          let pairs = 0;
          for (let b = 0; b < 6; b++) {
            if (isComplement(win[offset + b], win[offset + 11 - b])) pairs++;
          }
          if (pairs > maxPairs) maxPairs = pairs;
        }
        if (maxPairs >= 5 && gcFrac >= 0.65) {
          hairpinFactor = 0.52;
        } else if (gcFrac >= 0.78) {
          hairpinFactor = 0.68;
        }
      }
    }

    const effectiveRate = isStop
      ? baseRate
      : Math.max(0.25, baseRate * chargeFactor * polyProFactor * hairpinFactor);

    // Compute relative speed tag vs organism mean
    const allSenseRates = Object.entries(org.rates)
      .filter(([c]) => CODON_TO_AA[c] !== '*')
      .map(([, r]) => r);
    const orgMean = allSenseRates.reduce((a, b) => a + b, 0) / allSenseRates.length;

    let cause = 'none';
    if (polyProFactor < 0.9) cause = 'polypro';
    else if (chargeFactor < 0.85) cause = 'charge';
    else if (hairpinFactor < 0.9) cause = 'hairpin';
    else if (baseRate < orgMean * 0.55) cause = 'rare';

    rates.push({
      index: i,
      codon,
      aa,
      isStop,
      baseRate,
      chargeFactor,
      tunnelCharge,
      polyProFactor,
      hairpinFactor,
      effectiveRate,
      cause
    });
  }

  return rates;
}

/**
 * Inhomogeneous TASEP simulator with physical footprint L = 10 codons.
 */
export class TasepSimulator {
  constructor(kinetics, alpha = 0.55, beta = 2.8) {
    this.updateParameters(kinetics, alpha, beta, true);
  }

  updateParameters(kinetics, alpha, beta, reset = false) {
    this.kinetics = kinetics;
    this.N = kinetics.length;
    this.rates = kinetics.map((k) => k.effectiveRate);
    this.alpha = alpha;
    this.beta = beta;
    if (reset || !this.ribosomes) {
      this.reset();
    } else {
      // Clamp ribosomes if sequence shortened
      this.ribosomes = this.ribosomes.filter((r) => r.pos < this.N);
    }
  }

  reset() {
    this.ribosomes = [];
    this.nextId = 1;
    this.elapsedSec = 0;
    this.completed = 0;
    this.occTime = new Float64Array(this.N);
    this.collTime = new Float64Array(this.N);
    this.totalRibosomeTime = 0;
    // Seed 2 well-spaced ribosomes initially so canvas isn't empty on frame 0
    if (this.N > 28) {
      this.ribosomes.push({ id: this.nextId++, pos: 24, visualPos: 24, collided: false });
      this.ribosomes.push({ id: this.nextId++, pos: 4, visualPos: 4, collided: false });
    }
  }

  step(dtSec) {
    const maxSubDt = 0.014;
    const steps = Math.max(1, Math.ceil(dtSec / maxSubDt));
    const subDt = dtSec / steps;
    const L = RIBOSOME_FOOTPRINT;
    const N = this.N;

    for (let s = 0; s < steps; s++) {
      this.elapsedSec += subDt;
      this.totalRibosomeTime += this.ribosomes.length * subDt;

      // Sort 3' -> 5' (descending codon position)
      this.ribosomes.sort((a, b) => b.pos - a.pos);

      for (let idx = 0; idx < this.ribosomes.length; idx++) {
        const ribo = this.ribosomes[idx];
        const p = ribo.pos;
        this.occTime[p] += subDt;

        // Termination at stop codon
        if (p >= N - 1) {
          ribo.collided = false;
          const pTerm = 1 - Math.exp(-this.beta * subDt);
          if (Math.random() < pTerm) {
            this.completed++;
            this.ribosomes.splice(idx, 1);
            idx--;
          }
          continue;
        }

        // Check leading ribosome steric exclusion (A-site footprint L = 10)
        const leader = idx > 0 ? this.ribosomes[idx - 1] : null;
        const blocked = leader !== null && leader.pos - p <= L;

        if (blocked) {
          ribo.collided = true;
          this.collTime[p] += subDt;
        } else {
          ribo.collided = false;
          const k = this.rates[p];
          const pMove = 1 - Math.exp(-k * subDt);
          if (Math.random() < pMove) {
            ribo.pos = p + 1;
          }
        }
      }

      // Initiation at codon 0 if 0..L-1 is clear
      const canInit =
        this.ribosomes.length === 0 ||
        this.ribosomes[this.ribosomes.length - 1].pos >= L;
      if (canInit) {
        const pInit = 1 - Math.exp(-this.alpha * subDt);
        if (Math.random() < pInit) {
          this.ribosomes.push({ id: this.nextId++, pos: 0, visualPos: 0, collided: false });
        }
      }
    }

    // Smooth visual interpolation for 60 FPS canvas animation
    const lerp = Math.min(1, dtSec * 16);
    for (const r of this.ribosomes) {
      r.visualPos += (r.pos - r.visualPos) * lerp;
    }
  }
}

/**
 * Runs a fast deterministic-seeded steady-state TASEP ensemble (~12 ms)
 * to compute exact steady-state Ribo-Seq density, disome collision rate, flux & folding scores.
 */
export function runSteadyState(kinetics, alpha, beta, domains = []) {
  const sim = new TasepSimulator(kinetics, alpha, beta);
  sim.ribosomes = [];
  sim.nextId = 1;

  // Deterministic PRNG (Mulberry32) so identical inputs yield reproducible KPIs
  let seed = 133742;
  const rand = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const N = kinetics.length;
  const rates = kinetics.map((k) => k.effectiveRate);
  const L = RIBOSOME_FOOTPRINT;
  const subDt = 0.015;
  const warmupSteps = 1400; // 21s biological burn-in
  const measureSteps = 8000; // 120s biological sampling for smooth flux & low variance

  let ribos = [];
  const occTime = new Float64Array(N);
  const collTime = new Float64Array(N);
  let completed = 0;
  let totalRiboSteps = 0;

  const pInit = 1 - Math.exp(-alpha * subDt);
  const pTerm = 1 - Math.exp(-beta * subDt);
  const pMoveArr = rates.map((r) => 1 - Math.exp(-r * subDt));

  for (let step = 0; step < warmupSteps + measureSteps; step++) {
    const measuring = step >= warmupSteps;
    if (measuring) totalRiboSteps += ribos.length;

    for (let idx = 0; idx < ribos.length; idx++) {
      const p = ribos[idx];
      if (measuring) occTime[p] += subDt;

      if (p >= N - 1) {
        if (rand() < pTerm) {
          if (measuring) completed++;
          ribos.splice(idx, 1);
          idx--;
        }
        continue;
      }

      const blocked = idx > 0 && ribos[idx - 1] - p <= L;
      if (blocked) {
        if (measuring) collTime[p] += subDt;
      } else if (rand() < pMoveArr[p]) {
        ribos[idx] = p + 1;
      }
    }

    const canInit = ribos.length === 0 || ribos[ribos.length - 1] >= L;
    if (canInit && rand() < pInit) {
      ribos.push(0);
    }
  }

  const measureSec = measureSteps * subDt;
  const occupancy = Array.from(occTime, (v) => v / measureSec);
  const collisionRate = Array.from(collTime, (v) => v / measureSec);

  const fluxPerMin = (completed / measureSec) * 60;
  const meanRibosomes = totalRiboSteps / measureSteps;

  let peakCollision = 0;
  let sumCollision = 0;
  for (let i = 0; i < N; i++) {
    if (collisionRate[i] > peakCollision) peakCollision = collisionRate[i];
    sumCollision += collisionRate[i];
  }

  // RQC risk score (0-100): blends peak disome dwell + total collision burden
  const rqcRisk = Math.min(
    100,
    Math.round(peakCollision * 140 + (sumCollision / Math.max(1, N)) * 450)
  );

  // Mean sense codon speed
  const senseRates = kinetics.slice(1, N - 1).map((k) => k.effectiveRate);
  const geneMeanRate =
    senseRates.reduce((a, b) => a + b, 0) / Math.max(1, senseRates.length);

  // Evaluate +30 aa co-translational domain folding windows
  const foldingWindows = [];
  for (const dom of domains) {
    // dom.end is 1-based; convert to 0-based index
    const endIdx = dom.end - 1;
    const center = endIdx + 30;
    if (center >= N - 2) continue;
    const wStart = Math.max(1, center - 3);
    const wEnd = Math.min(N - 2, center + 4);
    let rateSum = 0;
    let collMax = 0;
    let count = 0;
    for (let i = wStart; i <= wEnd; i++) {
      rateSum += kinetics[i].effectiveRate;
      if (collisionRate[i] > collMax) collMax = collisionRate[i];
      count++;
    }
    const winRate = rateSum / Math.max(1, count);
    const relSpeed = winRate / Math.max(0.5, geneMeanRate);

    // Ideal folding pause: relative speed ~ 0.48 - 0.72 of gene mean, with low collision
    let score = 100;
    if (relSpeed > 0.72) {
      // Too fast -> insufficient pause for co-translational domain folding
      score -= (relSpeed - 0.72) * 185;
    } else if (relSpeed < 0.42) {
      // Too slow -> stalls
      score -= (0.42 - relSpeed) * 110;
    }
    if (collMax > 0.05) {
      score -= (collMax - 0.05) * 160;
    }
    score = Math.max(5, Math.min(100, Math.round(score)));

    foldingWindows.push({
      domainName: dom.name,
      color: dom.color,
      domainStart: dom.start,
      domainEnd: dom.end,
      startIdx: wStart,
      endIdx: wEnd,
      centerIdx: center,
      relSpeed,
      collMax,
      score
    });
  }

  const meanFoldingScore =
    foldingWindows.length > 0
      ? Math.round(
          foldingWindows.reduce((acc, w) => acc + w.score, 0) / foldingWindows.length
        )
      : null;

  return {
    occupancy,
    collisionRate,
    fluxPerMin,
    meanRibosomes,
    peakCollision,
    rqcRisk,
    geneMeanRate,
    foldingWindows,
    meanFoldingScore
  };
}
