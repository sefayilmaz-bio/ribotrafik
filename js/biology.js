// Standard Genetic Code + Organism-Specific Decoding Rates (codons/s) & CAI Weights

export const CODON_TO_AA = {
  TTT: 'F', TTC: 'F', TTA: 'L', TTG: 'L',
  CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
  ATT: 'I', ATC: 'I', ATA: 'I', ATG: 'M',
  GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
  TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S',
  CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
  ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
  GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
  TAT: 'Y', TAC: 'Y', TAA: '*', TAG: '*',
  CAT: 'H', CAC: 'H', CAA: 'Q', CAG: 'Q',
  AAT: 'N', AAC: 'N', AAA: 'K', AAG: 'K',
  GAT: 'D', GAC: 'D', GAA: 'E', GAG: 'E',
  TGT: 'C', TGC: 'C', TGA: '*', TGG: 'W',
  CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R',
  AGT: 'S', AGC: 'S', AGA: 'R', AGG: 'R',
  GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G'
};

export const AA_INFO = {
  A: { tr: 'Alanin', en: 'Alanine', charge: 0 },
  C: { tr: 'Sistein', en: 'Cysteine', charge: 0 },
  D: { tr: 'Aspartat', en: 'Aspartate', charge: -0.5 },
  E: { tr: 'Glutamat', en: 'Glutamate', charge: -0.5 },
  F: { tr: 'Fenilalanin', en: 'Phenylalanine', charge: 0 },
  G: { tr: 'Glisin', en: 'Glycine', charge: 0 },
  H: { tr: 'Histidin', en: 'Histidine', charge: 0.35 },
  I: { tr: 'İzolösin', en: 'Isoleucine', charge: 0 },
  K: { tr: 'Lizin', en: 'Lysine', charge: 1.0 },
  L: { tr: 'Lösin', en: 'Leucine', charge: 0 },
  M: { tr: 'Metiyonin', en: 'Methionine', charge: 0 },
  N: { tr: 'Asparagin', en: 'Asparagine', charge: 0 },
  P: { tr: 'Prolin', en: 'Proline', charge: 0 },
  Q: { tr: 'Glutamin', en: 'Glutamine', charge: 0 },
  R: { tr: 'Arjinin', en: 'Arginine', charge: 1.0 },
  S: { tr: 'Serin', en: 'Serine', charge: 0 },
  T: { tr: 'Treonin', en: 'Threonine', charge: 0 },
  V: { tr: 'Valin', en: 'Valine', charge: 0 },
  W: { tr: 'Triptofan', en: 'Tryptophan', charge: 0 },
  Y: { tr: 'Tirozin', en: 'Tyrosine', charge: 0 },
  '*': { tr: 'Durdurma', en: 'Stop', charge: 0 }
};

// Base decoding rates (codons/s) grounded in ribosome profiling & tRNA abundance estimates.
// Relative weights (w_c) are normalized within each synonymous codon box for CAI.
const HUMAN_RATES = {
  TTT: 5.4, TTC: 8.8, TTA: 2.3, TTG: 4.5,
  CTT: 4.6, CTC: 7.4, CTA: 2.0, CTG: 10.2,
  ATT: 5.7, ATC: 9.2, ATA: 2.2, ATG: 7.2,
  GTT: 4.2, GTC: 6.7, GTA: 2.4, GTG: 9.5,
  TCT: 5.6, TCC: 7.5, TCA: 4.2, TCG: 2.3,
  CCT: 6.1, CCC: 7.8, CCA: 5.8, CCG: 2.6,
  ACT: 5.5, ACC: 8.5, ACA: 5.0, ACG: 2.7,
  GCT: 6.3, GCC: 9.6, GCA: 5.2, GCG: 2.9,
  TAT: 5.4, TAC: 8.6, TAA: 3.0, TAG: 2.6,
  CAT: 5.1, CAC: 8.2, CAA: 4.7, CAG: 9.8,
  AAT: 5.5, AAC: 8.7, AAA: 5.8, AAG: 9.4,
  GAT: 6.2, GAC: 9.1, GAA: 6.1, GAG: 9.7,
  TGT: 5.3, TGC: 8.0, TGA: 3.2, TGG: 6.9,
  CGT: 4.1, CGC: 6.6, CGA: 1.5, CGG: 5.9,
  AGT: 4.9, AGC: 8.1, AGA: 2.5, AGG: 4.8,
  GGT: 5.2, GGC: 8.9, GGA: 5.4, GGG: 6.4
};

const ECOLI_RATES = {
  TTT: 14.5, TTC: 21.0, TTA: 9.0, TTG: 11.8,
  CTT: 9.4, CTC: 10.6, CTA: 4.4, CTG: 25.5,
  ATT: 16.5, ATC: 23.0, ATA: 3.6, ATG: 17.0,
  GTT: 19.2, GTC: 13.5, GTA: 15.0, GTG: 21.8,
  TCT: 15.5, TCC: 16.0, TCA: 10.2, TCG: 11.4,
  CCT: 9.8, CCC: 5.2, CCA: 13.0, CCG: 23.8,
  ACT: 15.2, ACC: 22.4, ACA: 8.5, ACG: 14.2,
  GCT: 18.0, GCC: 16.8, GCA: 19.4, GCG: 24.0,
  TAT: 14.8, TAC: 19.8, TAA: 6.5, TAG: 4.5,
  CAT: 13.2, CAC: 18.4, CAA: 12.6, CAG: 23.2,
  AAT: 13.8, AAC: 21.6, AAA: 24.5, AAG: 14.0,
  GAT: 21.2, GAC: 19.6, GAA: 24.8, GAG: 15.4,
  TGT: 12.0, TGC: 15.8, TGA: 5.2, TGG: 14.6,
  CGT: 22.8, CGC: 20.6, CGA: 3.8, CGG: 4.6,
  AGT: 10.4, AGC: 18.8, AGA: 2.8, AGG: 3.0,
  GGT: 22.0, GGC: 23.4, GGA: 6.2, GGG: 10.8
};

const YEAST_RATES = {
  TTT: 8.2, TTC: 13.8, TTA: 9.6, TTG: 15.4,
  CTT: 6.8, CTC: 3.8, CTA: 5.4, CTG: 6.2,
  ATT: 12.6, ATC: 13.4, ATA: 4.0, ATG: 11.2,
  GTT: 14.8, GTC: 12.2, GTA: 5.2, GTG: 7.4,
  TCT: 14.2, TCC: 11.6, TCA: 8.8, TCG: 4.6,
  CCT: 9.4, CCC: 4.4, CCA: 13.6, CCG: 3.2,
  ACT: 13.2, ACC: 12.4, ACA: 7.8, ACG: 4.2,
  GCT: 15.8, GCC: 12.0, GCA: 7.6, GCG: 3.6,
  TAT: 8.8, TAC: 14.0, TAA: 4.8, TAG: 3.5,
  CAT: 8.4, CAC: 11.8, CAA: 14.4, CAG: 6.6,
  AAT: 9.2, AAC: 13.6, AAA: 11.4, AAG: 15.6,
  GAT: 12.8, GAC: 10.6, GAA: 16.2, GAG: 7.2,
  TGT: 10.4, TGC: 6.0, TGA: 3.8, TGG: 10.2,
  CGT: 7.4, CGC: 3.4, CGA: 1.6, CGG: 2.4,
  AGT: 7.0, AGC: 6.4, AGA: 15.2, AGG: 4.8,
  GGT: 16.0, GGC: 7.8, GGA: 5.8, GGG: 4.4
};

function buildWeights(rateMap) {
  const maxByAA = {};
  for (const [codon, rate] of Object.entries(rateMap)) {
    const aa = CODON_TO_AA[codon];
    if (aa === '*') continue;
    maxByAA[aa] = Math.max(maxByAA[aa] || 0, rate);
  }
  const weights = {};
  for (const [codon, rate] of Object.entries(rateMap)) {
    const aa = CODON_TO_AA[codon];
    weights[codon] = aa === '*' ? 1 : Math.min(1, rate / maxByAA[aa]);
  }
  return weights;
}

export const ORGANISMS = {
  human: {
    id: 'human',
    label: 'H. sapiens',
    fullName: 'Homo sapiens',
    defaultBeta: 2.8,
    rates: HUMAN_RATES,
    weights: buildWeights(HUMAN_RATES)
  },
  ecoli: {
    id: 'ecoli',
    label: 'E. coli',
    fullName: 'Escherichia coli',
    defaultBeta: 5.5,
    rates: ECOLI_RATES,
    weights: buildWeights(ECOLI_RATES)
  },
  yeast: {
    id: 'yeast',
    label: 'S. cerevisiae',
    fullName: 'Saccharomyces cerevisiae',
    defaultBeta: 4.0,
    rates: YEAST_RATES,
    weights: buildWeights(YEAST_RATES)
  }
};

// Precompute synonymous codon lists per AA
const SYN_MAP = {};
for (const [codon, aa] of Object.entries(CODON_TO_AA)) {
  if (!SYN_MAP[aa]) SYN_MAP[aa] = [];
  SYN_MAP[aa].push(codon);
}

export function getSynonymousCodons(aa, organismId) {
  const org = ORGANISMS[organismId] || ORGANISMS.human;
  const list = SYN_MAP[aa] || [];
  return list
    .map((codon) => ({
      codon,
      rate: org.rates[codon],
      weight: org.weights[codon]
    }))
    .sort((a, b) => b.rate - a.rate);
}

export function translateCodons(codons) {
  return codons.map((c) => CODON_TO_AA[c] || '?');
}

export function computeCAI(codons, organismId) {
  const org = ORGANISMS[organismId] || ORGANISMS.human;
  let logSum = 0;
  let count = 0;
  for (let i = 0; i < codons.length; i++) {
    const aa = CODON_TO_AA[codons[i]];
    if (!aa || aa === '*' || aa === 'M' || aa === 'W') continue;
    const w = org.weights[codons[i]] || 0.1;
    logSum += Math.log(Math.max(0.05, w));
    count++;
  }
  return count > 0 ? Math.exp(logSum / count) : 1;
}

export function computeGC(codons) {
  let gc = 0;
  let total = 0;
  for (const c of codons) {
    for (const ch of c) {
      if (ch === 'G' || ch === 'C') gc++;
      total++;
    }
  }
  return total > 0 ? (gc / total) * 100 : 0;
}

export function verifyProteinIdentity(codonsA, codonsB) {
  if (codonsA.length !== codonsB.length) {
    return { identical: false, mutations: 0 };
  }
  let identical = true;
  let mutations = 0;
  for (let i = 0; i < codonsA.length; i++) {
    if (CODON_TO_AA[codonsA[i]] !== CODON_TO_AA[codonsB[i]]) {
      identical = false;
    }
    if (codonsA[i] !== codonsB[i]) {
      mutations++;
    }
  }
  return { identical, mutations };
}

export function parseSequence(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('>'));
  const clean = lines.join('').toUpperCase().replace(/U/g, 'T').replace(/\s+/g, '');

  if (!clean) {
    return { ok: false, error: 'Dizi boş / Sequence is empty.' };
  }
  if (/[^ACGT]/.test(clean)) {
    return { ok: false, error: 'Geçersiz nükleotid karakteri (yalnızca A, C, G, T, U) / Invalid nucleotide character.' };
  }

  const usableLen = clean.length - (clean.length % 3);
  if (usableLen < 108) {
    return { ok: false, error: 'En az 36 kodon (108 nt) gereklidir / Minimum 36 codons (108 nt) required.' };
  }
  if (usableLen > 1050) {
    return { ok: false, error: 'En fazla 350 kodon (1050 nt) desteklenir / Maximum 350 codons (1050 nt) supported.' };
  }

  const codons = [];
  for (let i = 0; i < usableLen; i += 3) {
    codons.push(clean.slice(i, i + 3));
  }

  const warnings = [];
  if (codons[0] !== 'ATG') {
    warnings.push('Başlangıç kodonu ATG değil / Start codon is not ATG.');
  }
  for (let i = 0; i < codons.length - 1; i++) {
    if (CODON_TO_AA[codons[i]] === '*') {
      return {
        ok: false,
        error: `Kodon #${i + 1} (${codons[i]}) erken durdurma kodonu / Premature stop codon at #${i + 1}.`
      };
    }
  }
  if (CODON_TO_AA[codons[codons.length - 1]] !== '*') {
    warnings.push('Son kodon durdurma kodonu değil; TAA eklendi / Terminal stop codon appended.');
    codons.push('TAA');
  }

  return { ok: true, codons, warnings };
}

export function parseDomainsText(text, maxCodon) {
  const palette = ['#0E7C7B', '#2563EB', '#7C3AED', '#059669'];
  const domains = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, idx) => {
    const parts = line.split(/[,;\t]+/).map((s) => s.trim());
    if (parts.length >= 3) {
      const name = parts[0];
      const start = Math.max(1, parseInt(parts[1], 10));
      const end = Math.min(maxCodon - 1, parseInt(parts[2], 10));
      if (name && Number.isFinite(start) && Number.isFinite(end) && end > start + 4) {
        domains.push({ name, start, end, color: palette[idx % palette.length] });
      }
    }
  });
  return domains;
}
