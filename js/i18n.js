const DICT = {
  tr: {
    appTitle: 'RiboTrafik',
    appSubtitle: 'mRNA Ribozom Trafiği, Dizom Çarpışması (RQC) ve Eş-Çevrimsel Katlanma Stüdyosu',
    presetLabel: 'Örnek Gen',
    organismLabel: 'Organizma',
    customFastaBtn: 'Özel FASTA / Domain',
    exportBtn: 'Dışa Aktar',
    exportFasta: 'Optimize FASTA İndir (.fasta)',
    exportCsv: 'Ribo-Seq & Çarpışma Tablosu (.csv)',
    exportJson: 'Tam Biyofizik Raporu (.json)',
    kpiFluxTitle: 'Protein Çevrim Akısı (J)',
    kpiFluxUnit: 'protein / dk',
    kpiFluxSub: 'Ortalama {n} ribozom aktif',
    kpiRqcTitle: 'Dizom Çarpışması & RQC Riski',
    kpiRqcUnit: '/ 100',
    kpiRqcPeak: 'Tepe çarpışma: %{pct}',
    kpiFoldTitle: 'Katlanma Penceresi Skoru',
    kpiFoldUnit: '/ 100',
    kpiFoldNone: 'Katlanma penceresi yok',
    kpiIdentityTitle: 'Protein Özdeşliği & CAI',
    kpiIdentityUnit: '%100 Özdeş',
    kpiIdentityDiff: 'Hata: Protein değişti!',
    kpiMutations: '{n} eşanlamlı mutasyon · CAI {cai}',
    statusSafe: 'Güvenli',
    statusModerate: 'Orta Yük',
    statusCritical: 'RQC Kritik',
    statusOptimal: 'Optimal Duraklama',
    statusTooFast: 'Çok Hızlı (Yanlış Katlanma)',
    statusStalled: 'Tıkalı',
    highwayTitle: 'Canlı Ribozom Otoyolu (Inhomogeneous TASEP · L = 10 kodon)',
    play: 'Oynat',
    pause: 'Duraklat',
    resetSim: 'Sıfırla',
    speedLabel: 'Hız',
    alphaLabel: 'Başlatma Hızı (α)',
    alphaUnit: 's⁻¹',
    toggleCharge: '+Q Tünel Sürtünmesi',
    togglePolyPro: 'PP Poli-Prolin',
    toggleHairpin: 'mRNA Firuzesi (Hairpin)',
    btnOptimize: 'RiboTrafik Optimize',
    btnMaxCai: 'Max-CAI (Klasik)',
    btnResetSeq: 'Orijinale Dön',
    chartTitle: 'Senkronize Sentetik Ribo-Seq, Uzama Hızı ve Domain Haritası',
    legendOcc: 'Ribozom Yoğunluğu (Ribo-Seq)',
    legendColl: 'Dizom Çarpışması',
    legendSpeed: 'Efektif Hız kᵢ (kodon/sn)',
    legendMean: 'Gen Ortalaması',
    legendWindow: '+30 aa Katlanma Penceresi',
    legendStall: 'AA Sürtünme (PP / +Q)',
    gridTitle: 'İnteraktif Kodon Izgarası',
    gridHint: 'Bir kodona tıklayarak sağda eşanlamlı değişim yapın',
    sculptorTitle: 'Eşanlamlı Kodon Heykeltıraşı',
    sculptorSelectHint: 'Kinetik denklem ve eşanlamlı kodonlar için ızgaradan veya grafikten bir kodon seçin.',
    codonPos: 'Kodon #{pos}',
    aminoAcidLabel: 'Amino Asit',
    activeTriplet: 'Aktif Kodon',
    rateFormulaTitle: 'Çarpımsal Biyofizik Hız Denklemi',
    stallCauseLabel: 'Yavaşlama Nedeni',
    synonymousListTitle: 'Eşanlamlı Kodonlar (Protein %100 Aynı Kalır)',
    causeNone: 'Doğal akış (engel yok)',
    causeRare: 'Nadir tRNA / Yavaş kodon',
    causeCharge: 'Çıkış tüneli +Q elektrostatik sürtünme',
    causePolypro: 'Peptidil transferaz (PP/PPP) sterik takılması',
    causeHairpin: 'Akış aşağı GC-zengin mRNA sekonder yapısı',
    stopCodonNote: 'Durdurma kodonu (β = {beta} s⁻¹)',
    startCodonNote: 'Başlatma kodonu (ATG sabit tutulur)',
    tooltipCodon: 'Kodon {pos} · {aa} ({codon})',
    tooltipRate: 'Efektif hız: {rate} s⁻¹ (baz {base} s⁻¹)',
    tooltipOcc: 'Ribo-Seq: %{occ} · Çarpışma: %{coll}',
    disomeBadge: 'DİZOM / RQC',
    windowTag: '+30 aa Katlanma',
    modalTitle: 'Özel mRNA Dizisi (FASTA) & Domain Tanımla',
    modalSeqLabel: 'Kodlama Dizisi (ATG ile başlayıp durdurma kodonuyla biten, 36–350 kodon)',
    modalDomLabel: 'Protein Domainleri (Her satır: Ad, Başlangıç, Bitiş — örnek: NBD1, 1, 50)',
    modalCancel: 'İptal',
    modalApply: 'Uygula ve Simüle Et',
    methodTitle: 'Bilimsel Metodoloji & Neden Önemli?',
    methodBody:
      'Klasik kodon optimizasyonu (Max-CAI), tüm yavaş kodonları en hızlılarıyla değiştirir. Ancak bu yaklaşım iki ciddi biyofiziksel sorun yaratır: (1) Yeni sentezlenen domain ribozom çıkış tünelinden (~30 aa) çıktıktan hemen sonraki eş-çevrimsel katlanma duraklamasını yok eder; (2) Çok hızlı 5\' bölgesi, ribozomları poli-prolin (PP/PPP) veya pozitif yüklü (+K/R) peptid takozlarının arkasına yığarak dizom çarpışmalarına ve Ribozom Kalite Kontrolü (RQC / ZNF598-Hel2) yıkımına yol açar. RiboTrafik, homojen olmayan TASEP (L = 10 kodon ayak izi) kullanarak 100% aynı amino asit dizisini koruyup trafiği akışkanlaştırır.',
    deltaBetter: '+{pct}%',
    deltaWorse: '{pct}%',
    baselineTag: 'Orijinale göre: {val}',
    foldedTag: 'Katlandı',
    translatingTag: 'Çevriliyor'
  },
  en: {
    appTitle: 'RiboTrafik',
    appSubtitle: 'mRNA Ribosome Traffic, Disome Collision (RQC) & Co-Translational Folding Studio',
    presetLabel: 'Sample Gene',
    organismLabel: 'Organism',
    customFastaBtn: 'Custom FASTA / Domains',
    exportBtn: 'Export',
    exportFasta: 'Download Optimized FASTA (.fasta)',
    exportCsv: 'Ribo-Seq & Collision Table (.csv)',
    exportJson: 'Full Biophysical Report (.json)',
    kpiFluxTitle: 'Translation Flux (J)',
    kpiFluxUnit: 'proteins / min',
    kpiFluxSub: 'Mean {n} active ribosomes',
    kpiRqcTitle: 'Disome Collisions & RQC Risk',
    kpiRqcUnit: '/ 100',
    kpiRqcPeak: 'Peak collision: {pct}%',
    kpiFoldTitle: 'Folding Window Score',
    kpiFoldUnit: '/ 100',
    kpiFoldNone: 'No folding window defined',
    kpiIdentityTitle: 'Protein Identity & CAI',
    kpiIdentityUnit: '100% Identical',
    kpiIdentityDiff: 'Error: Protein altered!',
    kpiMutations: '{n} synonymous edits · CAI {cai}',
    statusSafe: 'Safe',
    statusModerate: 'Moderate Load',
    statusCritical: 'RQC Critical',
    statusOptimal: 'Optimal Pause',
    statusTooFast: 'Too Fast (Misfold Risk)',
    statusStalled: 'Jammed',
    highwayTitle: 'Live Ribosome Highway (Inhomogeneous TASEP · L = 10 codons)',
    play: 'Play',
    pause: 'Pause',
    resetSim: 'Reset',
    speedLabel: 'Speed',
    alphaLabel: 'Initiation Rate (α)',
    alphaUnit: 's⁻¹',
    toggleCharge: '+Q Tunnel Drag',
    togglePolyPro: 'PP Poly-Proline',
    toggleHairpin: 'mRNA Hairpin',
    btnOptimize: 'RiboTrafik Optimize',
    btnMaxCai: 'Max-CAI (Naive)',
    btnResetSeq: 'Restore Original',
    chartTitle: 'Synchronized Synthetic Ribo-Seq, Elongation Speed & Domain Map',
    legendOcc: 'Ribosome Occupancy (Ribo-Seq)',
    legendColl: 'Disome Collision',
    legendSpeed: 'Effective Rate kᵢ (codons/s)',
    legendMean: 'Gene Mean',
    legendWindow: '+30 aa Folding Window',
    legendStall: 'AA Drag (PP / +Q)',
    gridTitle: 'Interactive Codon Grid',
    gridHint: 'Click any codon to sculpt synonymous choices on the right',
    sculptorTitle: 'Synonymous Codon Sculptor',
    sculptorSelectHint: 'Click a codon on the grid, chart, or highway to inspect its kinetics and swap synonymous codons.',
    codonPos: 'Codon #{pos}',
    aminoAcidLabel: 'Amino Acid',
    activeTriplet: 'Active Codon',
    rateFormulaTitle: 'Multiplicative Biophysical Rate Equation',
    stallCauseLabel: 'Bottleneck Cause',
    synonymousListTitle: 'Synonymous Codons (100% Identical Protein)',
    causeNone: 'Unimpeded elongation',
    causeRare: 'Rare tRNA / Slow codon',
    causeCharge: 'Exit tunnel +Q electrostatic drag',
    causePolypro: 'Peptidyl-transferase (PP/PPP) steric stall',
    causeHairpin: 'Downstream GC-rich mRNA secondary structure',
    stopCodonNote: 'Stop codon (termination β = {beta} s⁻¹)',
    startCodonNote: 'Start codon (ATG preserved)',
    tooltipCodon: 'Codon {pos} · {aa} ({codon})',
    tooltipRate: 'Effective rate: {rate} s⁻¹ (base {base} s⁻¹)',
    tooltipOcc: 'Ribo-Seq: {occ}% · Collision: {coll}%',
    disomeBadge: 'DISOME / RQC',
    windowTag: '+30 aa Folding',
    modalTitle: 'Custom mRNA Sequence (FASTA) & Domain Annotation',
    modalSeqLabel: 'Coding Sequence (starts with ATG, ends with stop codon, 36–350 codons)',
    modalDomLabel: 'Protein Domains (One per line: Name, Start, End — e.g. NBD1, 1, 50)',
    modalCancel: 'Cancel',
    modalApply: 'Apply & Simulate',
    methodTitle: 'Scientific Methodology & Why It Matters',
    methodBody:
      'Classical codon optimization (Max-CAI) blindly replaces every slow codon with the fastest synonymous triplet. This triggers two biophysical failure modes: (1) It erases natural co-translational folding pauses positioned ~30 aa downstream of domain boundaries (exit tunnel length); (2) High 5\' speed drives ribosomes into intrinsic amino-acid stalls (poly-proline PP/PPP motifs or positively charged +K/R peptides inside the exit tunnel), causing disome collisions and Ribosome-associated Quality Control (RQC / ZNF598-Hel2) degradation. RiboTrafik uses an inhomogeneous TASEP model (L = 10 codons) to smooth traffic and protect folding windows while preserving 100% protein identity.',
    deltaBetter: '+{pct}%',
    deltaWorse: '{pct}%',
    baselineTag: 'vs original: {val}',
    foldedTag: 'Folded',
    translatingTag: 'Translating'
  }
};

let currentLang = 'tr';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (DICT[lang]) {
    currentLang = lang;
  }
}

export function t(key, params = {}) {
  const table = DICT[currentLang] || DICT.tr;
  let str = table[key] ?? DICT.en[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });
}
