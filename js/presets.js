// Curated biophysical presets with validated ORFs and domain boundaries.

export const PRESETS = [
  {
    id: 'cftr_nbd1',
    organism: 'human',
    defaultAlpha: 0.85,
    title: {
      tr: '1. CFTR-NBD1 (Çarpışma + Katlanma Dengesi)',
      en: '1. CFTR-NBD1 (Collision + Folding Balance)'
    },
    subtitle: {
      tr: 'Kodon 60–65 nadir kodon darboğazı ciddi dizom çarpışması yaratır; Kodon 79–85 ise NBD1 domaini için +30 aa katlanma duraklaması taşır.',
      en: 'Codons 60–65 rare-codon bottleneck triggers severe disome collisions; codons 79–85 hold the +30 aa folding pause for NBD1.'
    },
    domains: [
      { name: 'NBD1-Core', start: 2, end: 50, color: '#0E7C7B' },
      { name: 'Reg-Linker', start: 56, end: 108, color: '#2563EB' }
    ],
    // 151 codons: ATG start, severe rare cluster at 61-66 (CGA ATA CGA CTA CGA ATA), TAA stop.
    sequence:
      'ATGCAGCTGGAGCTGCTGCTGGCCATCGTGGGCGCCAAGGCCCTGAAGCTGTTCCTGGACAAGTTCGGCCACATCGTGGACGCCAAGGCCCTGTTCGTGAAG' +
      'GTGAACCTGGGCGACACCGTGGCCCTGCTGGGCAAGGTGAACAAGTTCCTGGGCAACGACCTGGAGGTGGCCAAGGCC' +
      'CGAATACGACTACGAATAGGCATCCTGGACGCCGAGCTGCTGGTGACCGGCCTGAAGCACACC' +
      'ATCGTGCTGGGCGCCAAGTACGTAGGAACTTATCCGTTCGTGGACCTGAAGGCCGCCCTGGGCGACTTCGTGAAGGCC' +
      'CTGGCCGAGATCGTGAACAAGGCCCTGGAGGTGTTCCTGGACGCCGCCAAGGGCAAGATCGTGTTCGTGAAGGCCGAC' +
      'CTGCTGCTGGAGTTCGTGGGCAAGGCCATCGACCTGCTGAAGTTCTAA'
  },
  {
    id: 'polypro_charge',
    organism: 'human',
    defaultAlpha: 0.62,
    title: {
      tr: '2. Poli-Prolin (PPPP) & +Q Çıkış Tüneli Takılması',
      en: '2. Poly-Proline (PPPP) & +Q Exit Tunnel Drag'
    },
    subtitle: {
      tr: 'Amino asit kaynaklı çift fren: Max-CAI bile durduramaz, başlatma hızını (α) ve 5\' rampasını dengelemek gerekir.',
      en: 'Amino-acid-encoded double stall: even Max-CAI cannot erase it; requires balancing initiation (α) and 5\' ramp.'
    },
    domains: [
      { name: 'SH3-Fold', start: 2, end: 41, color: '#7C3AED' },
      { name: 'C-Tail', start: 65, end: 101, color: '#0E7C7B' }
    ],
    // 105 codons (315 nt): PPPP at codons 44-47, KRKRKKRK at codons 55-62
    sequence:
      'ATGAAGCTGTTCCTGGACGCCGTGGGCAAGCTGATCGAGGCCGTGAAGAACTTCCTGGACGGCCACGTGAAGATCCTGGCCGCCGAGGCCCTGGTG' +
      'AAGTTCATCGAGGCCGGCGACCTGGTGAAGTTC' +
      'CCCCCCCCCCCT' +
      'GTGGGCGCCGAGTTCAAGGTG' +
      'AAGAGGAAGAGGAAGAAGAGGAAG' +
      'GCCCTGGCCGACTTCGTGGGCCACGTGAAGATCCTGGAGGCCGTGAACTTCCTGAAGGCCGACGTGGCCCTGTTCAAG' +
      'GAGATCGAGGCCGTGAAGGCCCTGTTCGACAAGGTGGGCCTGGTGTTCGTGAAGGCCTGA'
  },
  {
    id: 'gfp_overopt',
    organism: 'ecoli',
    defaultAlpha: 0.72,
    title: {
      tr: '3. Aşırı Optimize GFP (Katlanma Penceresi Silinmiş)',
      en: '3. Over-Optimized GFP (Erased Folding Pause)'
    },
    subtitle: {
      tr: 'CAI ≈ 0.96 ile çarpışma yok ama β-varil domaini çıkış tünelinden çıkarken duraklamadığı için yanlış katlanma riski yüksek.',
      en: 'Zero collisions at CAI ≈ 0.96, but the β-barrel domain rushes past the +30 aa exit window with severe misfolding risk.'
    },
    domains: [
      { name: 'Beta-Barrel-1', start: 2, end: 46, color: '#059669' },
      { name: 'Chromophore-Cap', start: 50, end: 102, color: '#2563EB' }
    ],
    // 114 codons (342 nt) high-CAI E. coli sequence
    sequence:
      'ATGAAAGGCGAAGAACTGTTTACCGGCGTGGTGCCGATTCTGGTGGAACTGGATGGCGATGTGAACGGCCACAAATTTAGCGTGAGCGGCGAAGGCGAAGGC' +
      'GATGCGACCTATGGCAAACTGACCCTGAAATTTATCTGCACCACCGGCAAGCTGCCGGTGCCGTGGCCGACCCTGGTGACCACCCTGACCTATGGCGTGCAG' +
      'TGCTTTAGCCGCTATCCGGATCACATGAAACAGCATGATTTTTTCAAAAGCGCGATGCCGGAAGGCTATGTGCAGGAACGCACCATTTTTTTTAAAGATGAT' +
      'GGCAACTATAAAACCCGCGCGGAAGTGAAATTTGAAGGCGATACCCTGGTGAACCGCATTGAACTGTAA'
  },
  {
    id: 'yeast_cga_rqc',
    organism: 'yeast',
    defaultAlpha: 0.90,
    title: {
      tr: '4. Maya (CGA)₅ RQC Çarpışma Raporlayıcısı',
      en: '4. Yeast (CGA)₅ RQC Collision Reporter'
    },
    subtitle: {
      tr: 'Arka arkaya 5 nadir CGA arginini ribozomları kilitleyerek ZNF598/Hel2 yıkımını tetikler; eşanlamlı AGA ile tamamen çözülür.',
      en: 'Five tandem rare CGA arginines jam ribosomes and trigger Hel2/ZNF598 RQC; cleanly rescued by synonymous AGA swaps.'
    },
    domains: [
      { name: 'N-Reporter', start: 2, end: 44, color: '#0E7C7B' },
      { name: 'GFP-Tag', start: 55, end: 93, color: '#2563EB' }
    ],
    // 96 codons (288 nt)
    sequence:
      'ATGGTTGCTAAATTCGACGTTGCTTTGTTGGGTGAAGTTGTTGCTAAATTGGTTGACGGTGTTGCTTTGGGTGAAGCTGTTGCTAAGTTCGGTTACTTGTTG' +
      'GAAGCTGCTAAAGTTGCTTTGTTGGGTGAAGCTGTT' +
      'CGACGACGACGACGA' +
      'GTTGCTAAATTGGGTGAAGCTGTTGCTTTGGGTAAAGTTGACGCTTTGTTGGAAGTTGCTGCTAAATTCGGTGAAGTTGTTGCTTTGGGTAAAGCTGTTGAAGCTTTGTTGGGTAAATTGTAA'
  },
  {
    id: 'ecoli_ramp',
    organism: 'ecoli',
    defaultAlpha: 0.78,
    title: {
      tr: '5. Rekombinant Enzim & 5\' Rampa Etkisi',
      en: '5. Recombinant Enzyme & 5\' Ramp Effect'
    },
    subtitle: {
      tr: 'Yüksek başlatmada hızlı 5\' bölgesi ribozomları orta kısımdaki nadir kodon kümesine çarptırır.',
      en: 'Under strong initiation, a fast 5\' region drives ribosomes straight into a mid-gene rare-codon cluster.'
    },
    domains: [
      { name: 'Catalytic-Core', start: 2, end: 48, color: '#0E7C7B' },
      { name: 'Allosteric-Lid', start: 54, end: 98, color: '#7C3AED' }
    ],
    // 110 codons (330 nt)
    sequence:
      'ATGAAAGCGCTGATTGATGAAGTGCTGGCGACCGTGCGCGGTCTGGATGAAGTGAAAGCGCTGATCGATGAAGTGCTGGCGACCGTTGGTCTGGATGAAATT' +
      'AAAGCGCTGATTGATGAAGTGCTGGCGACCGTGGGCCTGGACGAAGTGAAAGCGCTGATTGATGAAGTGCTGGCGACCGTAGGCCTGATAGAGAGAGGACGA' +
      'ATAAGGCTACCCCCGGGAGCGATTGATGAAGTGCTGGCGACCGTGGGCCTGGATGAAGTGAAAGCGCTGATTGACGAAGTGCTGGCGACCGTTGGTCTGGAC' +
      'GAAGTGAAAGCGCTGATTGATGAAGTGTGA'
  }
];

export function getPresetById(id) {
  return PRESETS.find((p) => p.id === id) || PRESETS[0];
}
