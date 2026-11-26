import { t, getLang, setLang, applyI18n } from './i18n.js';
import {
  CODON_TO_AA,
  AA_INFO,
  ORGANISMS,
  getSynonymousCodons,
  computeCAI,
  computeGC,
  verifyProteinIdentity,
  parseSequence,
  parseDomainsText
} from './biology.js';
import { PRESETS, getPresetById } from './presets.js';
import { computeCodonKinetics, TasepSimulator, runSteadyState } from './physics.js';
import { optimizeMaxCAI, optimizeRiboTrafik } from './optimizer.js';
import { HighwayCanvas } from './canvas_highway.js';
import { BioChartsCanvas } from './canvas_charts.js';

function splitCodons(seq) {
  const arr = [];
  for (let i = 0; i + 3 <= seq.length; i += 3) {
    arr.push(seq.slice(i, i + 3));
  }
  return arr;
}

const appState = {
  presetId: PRESETS[0].id,
  organism: PRESETS[0].organism,
  originalCodons: splitCodons(PRESETS[0].sequence),
  codons: splitCodons(PRESETS[0].sequence),
  domains: PRESETS[0].domains.map((d) => ({ ...d })),
  alpha: PRESETS[0].defaultAlpha,
  beta: ORGANISMS[PRESETS[0].organism].defaultBeta,
  useChargeDrag: true,
  usePolyPro: true,
  useHairpin: true,
  playing: true,
  simSpeed: 1,
  selectedCodonIdx: 57,
  kinetics: [],
  baselineSteady: null,
  steady: null,
  sim: null
};

// DOM References
const presetSelect = document.getElementById('presetSelect');
const presetDesc = document.getElementById('presetDesc');
const organismToggle = document.getElementById('organismToggle');
const alphaSlider = document.getElementById('alphaSlider');
const alphaVal = document.getElementById('alphaVal');
const chkCharge = document.getElementById('chkCharge');
const chkPolyPro = document.getElementById('chkPolyPro');
const chkHairpin = document.getElementById('chkHairpin');
const btnPlayPause = document.getElementById('btnPlayPause');
const btnResetSim = document.getElementById('btnResetSim');
const btnOptimize = document.getElementById('btnOptimize');
const btnMaxCai = document.getElementById('btnMaxCai');
const btnResetSeq = document.getElementById('btnResetSeq');
const codonGridEl = document.getElementById('codonGrid');
const sculptorBodyEl = document.getElementById('sculptorBody');

const fastaModal = document.getElementById('fastaModal');
const fastaInput = document.getElementById('fastaInput');
const domainsInput = document.getElementById('domainsInput');
const fastaError = document.getElementById('fastaError');

const highwayView = new HighwayCanvas(
  document.getElementById('highwayCanvas'),
  document.getElementById('highwayTooltip'),
  (idx) => selectCodon(idx)
);

const chartsView = new BioChartsCanvas(
  document.getElementById('chartsCanvas'),
  document.getElementById('chartsTooltip'),
  (idx) => selectCodon(idx)
);

function populatePresets() {
  const lang = getLang();
  presetSelect.innerHTML = '';
  for (const p of PRESETS) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.title[lang] || p.title.tr;
    presetSelect.appendChild(opt);
  }
  if (appState.presetId === 'custom') {
    const opt = document.createElement('option');
    opt.value = 'custom';
    opt.textContent = lang === 'tr' ? 'Özel FASTA Dizisi' : 'Custom FASTA Sequence';
    presetSelect.appendChild(opt);
  }
  presetSelect.value = appState.presetId;
}

function updatePresetBanner() {
  const lang = getLang();
  if (appState.presetId === 'custom') {
    presetDesc.textContent =
      lang === 'tr'
        ? `Özel mRNA dizisi (${appState.codons.length} kodon) · GC %${computeGC(appState.codons).toFixed(1)}`
        : `Custom mRNA sequence (${appState.codons.length} codons) · GC ${computeGC(appState.codons).toFixed(1)}%`;
    return;
  }
  const p = getPresetById(appState.presetId);
  presetDesc.textContent = p.subtitle[lang] || p.subtitle.tr;
}

function syncControlsUI() {
  organismToggle.querySelectorAll('.seg-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.org === appState.organism);
  });
  alphaSlider.value = String(appState.alpha);
  alphaVal.textContent = appState.alpha.toFixed(2);
  chkCharge.checked = appState.useChargeDrag;
  chkPolyPro.checked = appState.usePolyPro;
  chkHairpin.checked = appState.useHairpin;
}

function computeBaseline() {
  const baseKin = computeCodonKinetics(appState.originalCodons, appState.organism, {
    useChargeDrag: appState.useChargeDrag,
    usePolyPro: appState.usePolyPro,
    useHairpin: appState.useHairpin
  });
  appState.baselineSteady = runSteadyState(
    baseKin,
    appState.alpha,
    appState.beta,
    appState.domains
  );
}

function recalculate(resetSim = false) {
  appState.kinetics = computeCodonKinetics(appState.codons, appState.organism, {
    useChargeDrag: appState.useChargeDrag,
    usePolyPro: appState.usePolyPro,
    useHairpin: appState.useHairpin
  });

  appState.steady = runSteadyState(
    appState.kinetics,
    appState.alpha,
    appState.beta,
    appState.domains
  );

  if (!appState.sim || resetSim) {
    appState.sim = new TasepSimulator(appState.kinetics, appState.alpha, appState.beta);
  } else {
    appState.sim.updateParameters(appState.kinetics, appState.alpha, appState.beta, false);
  }

  highwayView.setData({
    kinetics: appState.kinetics,
    steady: appState.steady,
    sim: appState.sim,
    domains: appState.domains,
    selectedIdx: appState.selectedCodonIdx
  });

  chartsView.setData({
    kinetics: appState.kinetics,
    steady: appState.steady,
    domains: appState.domains,
    selectedIdx: appState.selectedCodonIdx
  });

  renderKPIs();
  renderCodonGrid();
  renderSculptor();
}

function renderKPIs() {
  const s = appState.steady;
  const b = appState.baselineSteady;

  // 1. Flux
  document.getElementById('kpiFluxVal').textContent = s.fluxPerMin.toFixed(1);
  document.getElementById('kpiFluxSub').textContent = t('kpiFluxSub', {
    n: s.meanRibosomes.toFixed(1)
  });

  const fluxDeltaEl = document.getElementById('kpiFluxDelta');
  if (b && b.fluxPerMin > 0.05) {
    const pct = Math.round(((s.fluxPerMin - b.fluxPerMin) / b.fluxPerMin) * 100);
    fluxDeltaEl.textContent = pct >= 0 ? `+${pct}%` : `${pct}%`;
    fluxDeltaEl.className = `badge ${pct > 3 ? 'badge-safe' : pct < -3 ? 'badge-danger' : 'badge-neutral'}`;
  } else {
    fluxDeltaEl.textContent = '0%';
    fluxDeltaEl.className = 'badge badge-neutral';
  }

  // 2. RQC Risk
  document.getElementById('kpiRqcVal').textContent = String(s.rqcRisk);
  document.getElementById('kpiRqcSub').textContent = t('kpiRqcPeak', {
    pct: Math.round(s.peakCollision * 100)
  });
  const rqcBadge = document.getElementById('kpiRqcBadge');
  if (s.rqcRisk < 20) {
    rqcBadge.textContent = t('statusSafe');
    rqcBadge.className = 'badge badge-safe';
  } else if (s.rqcRisk < 50) {
    rqcBadge.textContent = t('statusModerate');
    rqcBadge.className = 'badge badge-warn';
  } else {
    rqcBadge.textContent = t('statusCritical');
    rqcBadge.className = 'badge badge-danger';
  }

  // 3. Folding Window Score
  const foldValEl = document.getElementById('kpiFoldVal');
  const foldBadgeEl = document.getElementById('kpiFoldBadge');
  const foldSubEl = document.getElementById('kpiFoldSub');
  if (s.meanFoldingScore === null || s.foldingWindows.length === 0) {
    foldValEl.textContent = '--';
    foldBadgeEl.textContent = '-';
    foldBadgeEl.className = 'badge badge-neutral';
    foldSubEl.textContent = t('kpiFoldNone');
  } else {
    foldValEl.textContent = String(s.meanFoldingScore);
    const firstW = s.foldingWindows[0];
    if (s.meanFoldingScore >= 72) {
      foldBadgeEl.textContent = t('statusOptimal');
      foldBadgeEl.className = 'badge badge-safe';
    } else if (firstW.collMax > 0.08) {
      foldBadgeEl.textContent = t('statusStalled');
      foldBadgeEl.className = 'badge badge-danger';
    } else {
      foldBadgeEl.textContent = t('statusTooFast');
      foldBadgeEl.className = 'badge badge-warn';
    }
    foldSubEl.textContent = s.foldingWindows
      .map((w) => `${w.domainName}: ${w.relSpeed.toFixed(2)}×`)
      .join(' · ');
  }

  // 4. Protein Identity & CAI
  const idCheck = verifyProteinIdentity(appState.originalCodons, appState.codons);
  const cai = computeCAI(appState.codons, appState.organism);
  document.getElementById('kpiIdentityVal').textContent = idCheck.identical ? '100%' : 'ERR';
  const idBadge = document.getElementById('kpiIdentityBadge');
  idBadge.textContent = idCheck.identical ? t('kpiIdentityUnit') : t('kpiIdentityDiff');
  idBadge.className = `badge ${idCheck.identical ? 'badge-teal' : 'badge-danger'}`;
  document.getElementById('kpiIdentitySub').textContent = t('kpiMutations', {
    n: idCheck.mutations,
    cai: cai.toFixed(2)
  });
}

function renderCodonGrid() {
  const { kinetics, steady, codons, originalCodons, selectedCodonIdx } = appState;
  const meanRate = steady ? steady.geneMeanRate : 6.0;
  const windowSet = new Set();
  if (steady && steady.foldingWindows) {
    for (const fw of steady.foldingWindows) {
      for (let i = fw.startIdx; i <= fw.endIdx; i++) windowSet.add(i);
    }
  }

  const frag = document.createDocumentFragment();
  for (let i = 0; i < kinetics.length; i++) {
    const k = kinetics[i];
    const ratio = k.effectiveRate / Math.max(1, meanRate);
    const dotClass = ratio >= 0.85 ? 'dot-fast' : ratio >= 0.52 ? 'dot-mid' : 'dot-slow';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'codon-tile';
    if (i === selectedCodonIdx) btn.classList.add('selected');
    if (codons[i] !== originalCodons[i]) btn.classList.add('mutated');
    if (windowSet.has(i)) btn.classList.add('in-window');
    btn.dataset.idx = String(i);
    btn.innerHTML = `
      <span class="codon-idx">${i + 1}</span>
      <span class="codon-aa">${k.aa}</span>
      <span class="codon-trip">${k.codon}</span>
      <span class="speed-dot ${dotClass}"></span>
    `;
    btn.addEventListener('click', () => selectCodon(i));
    frag.appendChild(btn);
  }
  codonGridEl.innerHTML = '';
  codonGridEl.appendChild(frag);
}

function selectCodon(idx) {
  if (idx < 0 || idx >= appState.codons.length) return;
  appState.selectedCodonIdx = idx;
  highwayView.selectedIdx = idx;
  chartsView.selectedIdx = idx;
  chartsView.render();
  renderCodonGrid();
  renderSculptor();
}

function renderSculptor() {
  const idx = appState.selectedCodonIdx;
  const k = appState.kinetics[idx];
  if (!k) {
    sculptorBodyEl.innerHTML = `<p class="sculptor-empty">${t('sculptorSelectHint')}</p>`;
    return;
  }

  const lang = getLang();
  const aaName = AA_INFO[k.aa]?.[lang] || k.aa;
  const causeKey =
    k.cause === 'polypro'
      ? 'causePolypro'
      : k.cause === 'charge'
      ? 'causeCharge'
      : k.cause === 'hairpin'
      ? 'causeHairpin'
      : k.cause === 'rare'
      ? 'causeRare'
      : 'causeNone';

  let synHtml = '';
  if (idx === 0) {
    synHtml = `<p class="sculptor-empty">${t('startCodonNote')}</p>`;
  } else if (k.isStop) {
    synHtml = `<p class="sculptor-empty">${t('stopCodonNote', { beta: appState.beta.toFixed(1) })}</p>`;
  } else {
    const syns = getSynonymousCodons(k.aa, appState.organism);
    synHtml = `<div class="syn-list">
      ${syns
        .map(
          (s) => `
          <button type="button" class="syn-btn ${s.codon === k.codon ? 'current' : ''}" data-syn="${s.codon}">
            <span>${s.codon}</span>
            <span>${s.rate.toFixed(1)} s⁻¹ · w=${s.weight.toFixed(2)}</span>
          </button>
        `
        )
        .join('')}
    </div>`;
  }

  sculptorBodyEl.innerHTML = `
    <div class="sculptor-meta">
      <div class="meta-box">
        <span class="meta-label">${t('codonPos', { pos: idx + 1 })}</span>
        <span class="meta-val">${k.aa} (${aaName})</span>
      </div>
      <div class="meta-box">
        <span class="meta-label">${t('activeTriplet')}</span>
        <span class="meta-val mono">${k.codon} · ${k.effectiveRate.toFixed(2)} s⁻¹</span>
      </div>
    </div>

    <div class="formula-box">
      <div><strong>${t('rateFormulaTitle')}:</strong></div>
      <div>k_eff = ${k.baseRate.toFixed(1)} × ${k.chargeFactor.toFixed(2)}(+Q) × ${k.polyProFactor.toFixed(2)}(PP) × ${k.hairpinFactor.toFixed(2)}(HP) = <strong>${k.effectiveRate.toFixed(2)} s⁻¹</strong></div>
      <div style="margin-top:4px;color:#475569">${t('stallCauseLabel')}: <strong>${t(causeKey)}</strong></div>
    </div>

    <div style="margin-bottom:6px;font-weight:600;font-size:0.8rem">${t('synonymousListTitle')}</div>
    ${synHtml}
  `;

  sculptorBodyEl.querySelectorAll('.syn-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextCodon = btn.dataset.syn;
      if (nextCodon && CODON_TO_AA[nextCodon] === k.aa) {
        appState.codons[idx] = nextCodon;
        recalculate(false);
      }
    });
  });
}

function loadPreset(presetId) {
  const preset = getPresetById(presetId);
  appState.presetId = preset.id;
  appState.organism = preset.organism;
  appState.originalCodons = splitCodons(preset.sequence);
  appState.codons = [...appState.originalCodons];
  appState.domains = preset.domains.map((d) => ({ ...d }));
  appState.alpha = preset.defaultAlpha;
  appState.beta = ORGANISMS[preset.organism].defaultBeta;
  appState.selectedCodonIdx = Math.min(appState.codons.length - 2, Math.floor(appState.codons.length * 0.5));
  syncControlsUI();
  updatePresetBanner();
  computeBaseline();
  recalculate(true);
}

// Event Listeners
presetSelect.addEventListener('change', (e) => loadPreset(e.target.value));

organismToggle.querySelectorAll('.seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    appState.organism = btn.dataset.org;
    appState.beta = ORGANISMS[appState.organism].defaultBeta;
    syncControlsUI();
    computeBaseline();
    recalculate(true);
  });
});

alphaSlider.addEventListener('input', () => {
  appState.alpha = parseFloat(alphaSlider.value);
  alphaVal.textContent = appState.alpha.toFixed(2);
  computeBaseline();
  recalculate(false);
});

[chkCharge, chkPolyPro, chkHairpin].forEach((chk) => {
  chk.addEventListener('change', () => {
    appState.useChargeDrag = chkCharge.checked;
    appState.usePolyPro = chkPolyPro.checked;
    appState.useHairpin = chkHairpin.checked;
    computeBaseline();
    recalculate(false);
  });
});

btnPlayPause.addEventListener('click', () => {
  appState.playing = !appState.playing;
  btnPlayPause.innerHTML = appState.playing
    ? `⏸ <span>${t('pause')}</span>`
    : `▶ <span>${t('play')}</span>`;
});

btnResetSim.addEventListener('click', () => {
  if (appState.sim) appState.sim.reset();
});

document.querySelectorAll('.speed-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    appState.simSpeed = parseFloat(btn.dataset.speed);
  });
});

btnOptimize.addEventListener('click', () => {
  appState.codons = optimizeRiboTrafik(
    appState.originalCodons,
    appState.organism,
    {
      alpha: appState.alpha,
      beta: appState.beta,
      useChargeDrag: appState.useChargeDrag,
      usePolyPro: appState.usePolyPro,
      useHairpin: appState.useHairpin
    },
    appState.domains
  );
  recalculate(false);
});

btnMaxCai.addEventListener('click', () => {
  appState.codons = optimizeMaxCAI(appState.originalCodons, appState.organism);
  recalculate(false);
});

btnResetSeq.addEventListener('click', () => {
  appState.codons = [...appState.originalCodons];
  recalculate(false);
});

// Language switcher
document.querySelectorAll('.lang-switch .seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang-switch .seg-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    setLang(btn.dataset.lang);
    applyI18n();
    populatePresets();
    updatePresetBanner();
    renderKPIs();
    renderSculptor();
    chartsView.render();
  });
});

// Export menu & downloads
const exportMenuBtn = document.getElementById('exportMenuBtn');
const exportMenu = document.getElementById('exportMenu');
exportMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  exportMenu.classList.toggle('hidden');
});
document.addEventListener('click', () => exportMenu.classList.add('hidden'));

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('exportFastaBtn').addEventListener('click', () => {
  const seq = appState.codons.join('');
  const wrapped = seq.match(/.{1,60}/g)?.join('\n') || seq;
  const fasta = `>RiboTrafik_${appState.presetId}_${appState.organism}_CAI_${computeCAI(appState.codons, appState.organism).toFixed(2)}\n${wrapped}\n`;
  downloadFile(`ribotrafik_${appState.presetId}.fasta`, fasta, 'text/plain');
});

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  const rows = ['codon_index,codon,aa,base_rate,effective_rate,occupancy,collision_rate,cause'];
  appState.kinetics.forEach((k, i) => {
    rows.push(
      [
        i + 1,
        k.codon,
        k.aa,
        k.baseRate.toFixed(2),
        k.effectiveRate.toFixed(2),
        appState.steady.occupancy[i].toFixed(4),
        appState.steady.collisionRate[i].toFixed(4),
        k.cause
      ].join(',')
    );
  });
  downloadFile(`ribotrafik_${appState.presetId}_riboseq.csv`, rows.join('\n'), 'text/csv');
});

document.getElementById('exportJsonBtn').addEventListener('click', () => {
  const payload = {
    preset: appState.presetId,
    organism: appState.organism,
    alpha: appState.alpha,
    beta: appState.beta,
    cai: computeCAI(appState.codons, appState.organism),
    proteinIdentity: verifyProteinIdentity(appState.originalCodons, appState.codons),
    steadyState: {
      fluxPerMin: appState.steady.fluxPerMin,
      rqcRisk: appState.steady.rqcRisk,
      peakCollision: appState.steady.peakCollision,
      meanFoldingScore: appState.steady.meanFoldingScore,
      foldingWindows: appState.steady.foldingWindows
    },
    sequence: appState.codons.join('')
  };
  downloadFile(`ribotrafik_${appState.presetId}_report.json`, JSON.stringify(payload, null, 2), 'application/json');
});

// Custom FASTA Modal
document.getElementById('openFastaBtn').addEventListener('click', () => {
  fastaInput.value = `>Custom_${appState.presetId}\n${appState.codons.join('')}`;
  domainsInput.value = appState.domains.map((d) => `${d.name}, ${d.start}, ${d.end}`).join('\n');
  fastaError.classList.add('hidden');
  fastaModal.classList.remove('hidden');
});

document.getElementById('cancelFastaBtn').addEventListener('click', () => {
  fastaModal.classList.add('hidden');
});

document.getElementById('applyFastaBtn').addEventListener('click', () => {
  const parsed = parseSequence(fastaInput.value);
  if (!parsed.ok) {
    fastaError.textContent = parsed.error;
    fastaError.classList.remove('hidden');
    return;
  }
  appState.presetId = 'custom';
  appState.originalCodons = [...parsed.codons];
  appState.codons = [...parsed.codons];
  appState.domains = parseDomainsText(domainsInput.value, parsed.codons.length);
  appState.selectedCodonIdx = 1;
  fastaModal.classList.add('hidden');
  populatePresets();
  updatePresetBanner();
  computeBaseline();
  recalculate(true);
});

// Animation Loop
let lastTs = performance.now();
function frame(ts) {
  const realDt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;
  if (appState.playing && appState.sim) {
    appState.sim.step(realDt * appState.simSpeed);
  }
  highwayView.render(realDt);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', () => {
  chartsView.render();
  highwayView.render(0);
});

// Expose read-only inspection hook for automated verification
window.__ribotrafik = {
  getState: () => ({
    presetId: appState.presetId,
    organism: appState.organism,
    codonCount: appState.codons.length,
    alpha: appState.alpha,
    steady: appState.steady,
    identity: verifyProteinIdentity(appState.originalCodons, appState.codons),
    cai: computeCAI(appState.codons, appState.organism)
  })
};

// Boot
applyI18n();
populatePresets();
loadPreset(PRESETS[0].id);
requestAnimationFrame(frame);
