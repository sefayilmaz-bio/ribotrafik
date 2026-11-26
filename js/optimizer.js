import { CODON_TO_AA, getSynonymousCodons, verifyProteinIdentity } from './biology.js';
import { computeCodonKinetics, runSteadyState } from './physics.js';

/**
 * Classical naive Max-CAI optimizer: picks the fastest synonymous codon everywhere.
 * Maximizes raw decoding speed but destroys folding pauses and ignores traffic jams.
 */
export function optimizeMaxCAI(codons, organismId) {
  const out = [...codons];
  for (let i = 1; i < out.length - 1; i++) {
    const aa = CODON_TO_AA[out[i]];
    if (!aa || aa === '*') continue;
    const syns = getSynonymousCodons(aa, organismId);
    if (syns.length > 0) {
      out[i] = syns[0].codon;
    }
  }
  return out;
}

/**
 * Traffic-aware & co-translational folding-aware synonymous optimizer.
 * 1) Preserves ATG start and terminal stop, 100% protein identity guaranteed.
 * 2) Eliminates rare-codon bottlenecks in normal coding regions while avoiding GC hairpins.
 * 3) Builds a smooth 5' spacing ramp (codons 1..12) when unavoidable AA stalls exist downstream.
 * 4) Sculpts intermediate-speed synonymous pauses (~0.52-0.66x gene mean) inside +30 aa folding windows,
 *    and iteratively verifies via TASEP steady-state that no window causes disome collisions.
 */
export function optimizeRiboTrafik(codons, organismId, params, domains = []) {
  const { alpha, beta, useChargeDrag, usePolyPro, useHairpin } = params;
  const optFlags = { useChargeDrag, usePolyPro, useHairpin };
  const n = codons.length;
  const out = [...codons];

  // Collect folding window indices (0-based)
  const windowMap = new Map();
  for (const dom of domains) {
    const center = dom.end - 1 + 30;
    if (center >= n - 2) continue;
    const wStart = Math.max(1, center - 3);
    const wEnd = Math.min(n - 2, center + 4);
    for (let idx = wStart; idx <= wEnd; idx++) {
      windowMap.set(idx, true);
    }
  }

  // Detect whether sequence has intrinsic amino-acid stalls (polypro or +Q drag)
  const baseKinetics = computeCodonKinetics(out, organismId, optFlags);
  const hasIntrinsicAaStall = baseKinetics.some(
    (k) => k.polyProFactor < 0.85 || k.chargeFactor < 0.85
  );

  // Pass 1: Accelerate non-window codons to eliminate rare-codon bottlenecks
  const rampEnd = hasIntrinsicAaStall ? Math.min(12, Math.floor(n * 0.14)) : 0;
  for (let i = 1; i < n - 1; i++) {
    if (windowMap.has(i)) continue;
    const aa = CODON_TO_AA[out[i]];
    if (!aa || aa === '*') continue;
    const syns = getSynonymousCodons(aa, organismId);
    if (syns.length <= 1) continue;

    if (i <= rampEnd) {
      // Gentle 5' spacing ramp only when an unavoidable AA stall exists downstream
      const maxR = syns[0].rate;
      const target = maxR * 0.72;
      let best = syns[0];
      let bestDiff = Infinity;
      for (const s of syns) {
        if (s.rate < maxR * 0.45) continue;
        const diff = Math.abs(s.rate - target);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = s;
        }
      }
      out[i] = best.codon;
    } else {
      out[i] = syns[0].codon;
    }
  }

  // Pass 2: Check kinetics to compute the new gene mean elongation rate
  let kinetics = computeCodonKinetics(out, organismId, optFlags);
  const senseRates = kinetics.slice(1, n - 1).map((k) => k.effectiveRate);
  const geneMean = senseRates.reduce((a, b) => a + b, 0) / Math.max(1, senseRates.length);

  // Target folding pause speed inside each +30 aa folding window: ~0.58 * geneMean
  const targetWindowRate = geneMean * 0.58;
  for (const idx of windowMap.keys()) {
    const aa = CODON_TO_AA[out[idx]];
    const syns = getSynonymousCodons(aa, organismId);
    if (syns.length <= 1) continue;

    let best = syns[0];
    let bestScore = Infinity;
    for (const s of syns) {
      // Avoid ultra-slow codons that cause collisions; prefer smooth ~0.48-0.68x mean
      const floorPenalty = s.rate < geneMean * 0.34 ? 10 : 0;
      const diff = Math.abs(s.rate - targetWindowRate) + floorPenalty;
      if (diff < bestScore) {
        bestScore = diff;
        best = s;
      }
    }
    out[idx] = best.codon;
  }

  // Pass 3: Closed-loop TASEP collision guard — if any folding window still causes disome collision > 5%,
  // nudge the slowest codon in that window up one synonymous speed tier.
  for (let iter = 0; iter < 6; iter++) {
    kinetics = computeCodonKinetics(out, organismId, optFlags);
    const steady = runSteadyState(kinetics, alpha, beta, domains);
    let nudged = false;

    for (const fw of steady.foldingWindows) {
      if (fw.collMax > 0.05) {
        // Find slowest mutable codon in [fw.startIdx .. fw.endIdx]
        let slowestIdx = -1;
        let slowestRate = Infinity;
        for (let i = fw.startIdx; i <= fw.endIdx; i++) {
          const syns = getSynonymousCodons(CODON_TO_AA[out[i]], organismId);
          const curIdx = syns.findIndex((s) => s.codon === out[i]);
          if (curIdx > 0 && kinetics[i].effectiveRate < slowestRate) {
            slowestRate = kinetics[i].effectiveRate;
            slowestIdx = i;
          }
        }
        if (slowestIdx !== -1) {
          const syns = getSynonymousCodons(CODON_TO_AA[out[slowestIdx]], organismId);
          const curIdx = syns.findIndex((s) => s.codon === out[slowestIdx]);
          if (curIdx > 0) {
            out[slowestIdx] = syns[curIdx - 1].codon;
            nudged = true;
          }
        }
      }
    }
    if (!nudged) break;
  }

  // Safety guarantee: protein identity must be 100% preserved
  const check = verifyProteinIdentity(codons, out);
  if (!check.identical) {
    throw new Error('Invariant violated: protein sequence changed during optimization');
  }

  return out;
}
