'use strict';

const $ = (id) => document.getElementById(id);

const input = $('audioInput');
const dropZone = $('dropZone');
const analyzeBtn = $('analyzeBtn');
const busyText = $('busyText');
const fileName = $('fileName');
const fileHelp = $('fileHelp');
const canvas = $('waveCanvas');
const ctx = canvas.getContext('2d');
const scanline = $('scanline');
const waveWrap = canvas.parentElement;
const calcRow = $('calcRow');
const metricCards = Array.from(document.querySelectorAll('.metric-card'));

let selectedFile = null;
let busyTimer = null;

const ids = {
  trackHeadline: $('trackHeadline'),
  scoreValue: $('scoreValue'),
  scoreProgress: $('scoreProgress'),
  scoreStatus: $('scoreStatus'),
  scoreSummary: $('scoreSummary'),
  waveMeta: $('waveMeta'),
  peakValue: $('peakValue'), rmsValue: $('rmsValue'), clipValue: $('clipValue'),
  stereoValue: $('stereoValue'), silenceValue: $('silenceValue'), dynamicValue: $('dynamicValue'),
  peakFill: $('peakFill'), rmsFill: $('rmsFill'), clipFill: $('clipFill'),
  stereoFill: $('stereoFill'), silenceFill: $('silenceFill'), dynamicFill: $('dynamicFill'),
  peakText: $('peakText'), rmsText: $('rmsText'), clipText: $('clipText'),
  stereoText: $('stereoText'), silenceText: $('silenceText'), dynamicText: $('dynamicText'),
  goodList: $('goodList'), fixList: $('fixList'),
  peakPenalty: $('peakPenalty'), clipPenalty: $('clipPenalty'), otherPenalty: $('otherPenalty'), finalScore: $('finalScore'),
  scorePath: $('scorePath'), noteResult: $('noteResult'), noteResultText: $('noteResultText'),
  noteReason: $('noteReason'), noteReasonText: $('noteReasonText'), noteNext: $('noteNext'), noteNextText: $('noteNextText')
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const db = (v) => v <= 0 ? -Infinity : 20 * Math.log10(v);
const pct = (v) => `${v.toFixed(v < 1 ? 3 : 1)}%`;
const formatTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function statusForScore(score) {
  if (score >= 90) return ['Release-ready shape', 'Your track is in a strong technical shape. Do a reference listen before final upload.'];
  if (score >= 75) return ['Good, minor checks', 'A few small adjustments can make this release-ready.'];
  if (score >= 60) return ['Needs mix review', 'The track is usable, but a few technical issues should be checked.'];
  return ['Fix before release', 'Important technical issues were detected before release.'];
}

function penaltyPeak(peakDb) {
  if (peakDb >= -0.05) return 15;
  if (peakDb >= -0.25) return 12;
  if (peakDb >= -0.75) return 8;
  if (peakDb >= -1.0) return 4;
  return 0;
}

function penaltyClip(clipPct) {
  if (clipPct > 1) return 18;
  if (clipPct > 0.25) return 12;
  if (clipPct > 0.02) return 5;
  if (clipPct > 0.005) return 2;
  return 0;
}

function animateNumber(el, from, to, duration = 850) {
  const start = performance.now();
  const step = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setFill(id, value, state = 'ok') {
  const fill = ids[id];
  if (!fill) return;
  fill.style.width = `${clamp(value, 0, 100)}%`;
  fill.closest('.metric-card')?.setAttribute('data-state', state);
}

function setSelectedFile(file) {
  if (!file || !file.type.startsWith('audio')) {
    alert('Please choose an audio file.');
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileHelp.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB · click to change file`;
  ids.trackHeadline.textContent = `${file.name} is ready for local analysis.`;
  analyzeBtn.disabled = false;
  dropZone.classList.add('has-file');
}

function startBusyState() {
  const lines = ['Reading waveform…', 'Checking peak…', 'Measuring dynamics…', 'Building Studio Note…'];
  let i = 0;
  analyzeBtn.classList.add('loading');
  analyzeBtn.disabled = true;
  busyText.textContent = lines[0];
  busyTimer = setInterval(() => {
    i = (i + 1) % lines.length;
    busyText.textContent = lines[i];
  }, 650);
}

function stopBusyState() {
  clearInterval(busyTimer);
  analyzeBtn.classList.remove('loading');
  analyzeBtn.disabled = false;
}

input.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) setSelectedFile(file);
});

['dragenter', 'dragover'].forEach((name) => {
  dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });
});
['dragleave', 'drop'].forEach((name) => {
  dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
  });
});
dropZone.addEventListener('drop', (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) setSelectedFile(file);
});

analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  startBusyState();
  try {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const buffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    await audioCtx.close();
    analyzeBuffer(buffer, selectedFile.name);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.error(error);
    alert('This audio file could not be decoded by your browser. Try MP3, WAV, M4A, or WEBM.');
  } finally {
    stopBusyState();
  }
});

function drawEmptyWave() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(139,232,255,.13)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(196,212,229,.48)';
  ctx.font = '28px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Waveform appears after analysis', w / 2, h / 2 - 10);
}

function drawWaveform(buffer) {
  const w = canvas.width;
  const h = canvas.height;
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.ceil(data.length / w));
  const mid = h / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.035)';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,.055)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 90) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, 'rgba(16,120,148,.84)');
  gradient.addColorStop(.55, 'rgba(22,197,238,.96)');
  gradient.addColorStop(1, 'rgba(139,232,255,.9)');
  ctx.fillStyle = gradient;

  for (let x = 0; x < w; x++) {
    let min = 1;
    let max = -1;
    for (let j = 0; j < step; j++) {
      const v = data[(x * step) + j] || 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const y1 = (1 + min) * mid;
    const y2 = (1 + max) * mid;
    ctx.fillRect(x, y1, 1, Math.max(1, y2 - y1));
  }

  waveWrap.classList.remove('reveal-wave');
  scanline.classList.remove('run');
  void waveWrap.offsetWidth;
  waveWrap.classList.add('reveal-wave');
  scanline.classList.add('run');
}

function analyzeBuffer(buffer, name) {
  const channels = buffer.numberOfChannels;
  const left = buffer.getChannelData(0);
  const right = channels > 1 ? buffer.getChannelData(1) : left;
  const len = left.length;
  let peak = 0, sumSq = 0, clip = 0, low = 0, lSq = 0, rSq = 0;
  const clipThreshold = 0.999;
  const lowThreshold = Math.pow(10, -50 / 20);

  for (let i = 0; i < len; i++) {
    const l = left[i] || 0;
    const r = right[i] || 0;
    const mono = (l + r) / 2;
    const abs = Math.abs(mono);
    if (abs > peak) peak = abs;
    sumSq += mono * mono;
    lSq += l * l;
    rSq += r * r;
    if (Math.abs(l) >= clipThreshold || Math.abs(r) >= clipThreshold) clip++;
    if (abs < lowThreshold) low++;
  }

  const rms = Math.sqrt(sumSq / len);
  const peakDb = db(peak);
  const rmsDb = db(rms);
  const clipPct = (clip / len) * 100;
  const silencePct = (low / len) * 100;
  const lRms = Math.sqrt(lSq / len);
  const rRms = Math.sqrt(rSq / len);
  const lDb = db(lRms);
  const rDb = db(rRms);
  const stereoDb = Math.abs(lDb - rDb);
  const louder = lDb >= rDb ? 'L-heavy' : 'R-heavy';
  const crest = peakDb - rmsDb;

  const pPeak = penaltyPeak(peakDb);
  const pClip = penaltyClip(clipPct);
  const pRms = rmsDb > -7 ? 8 : rmsDb > -9 ? 4 : rmsDb < -24 ? 8 : rmsDb < -18 ? 4 : 0;
  const pStereo = stereoDb > 4 ? 7 : stereoDb > 2 ? 3 : 0;
  const pSilence = silencePct > 18 ? 8 : silencePct > 8 ? 4 : 0;
  const pDyn = crest < 6 ? 8 : crest < 8 ? 3 : 0;
  const pOther = pRms + pStereo + pSilence + pDyn;
  const score = clamp(Math.round(100 - pPeak - pClip - pOther), 0, 100);
  const [label, summary] = statusForScore(score);

  ids.trackHeadline.textContent = `${name} · ${formatTime(buffer.duration)} · ${(buffer.sampleRate / 1000).toFixed(1)} kHz · ${channels === 1 ? 'Mono' : 'Stereo'}`;
  ids.waveMeta.textContent = `${formatTime(buffer.duration)} · ${channels} ch · ${(buffer.sampleRate / 1000).toFixed(1)} kHz`;
  ids.scoreStatus.textContent = label;
  ids.scoreSummary.textContent = summary;
  animateNumber(ids.scoreValue, 0, score, 900);

  const ringLen = 540;
  ids.scoreProgress.style.strokeDashoffset = `${ringLen - ringLen * score / 100}`;
  ids.scoreProgress.style.stroke = score >= 90 ? 'var(--green)' : score >= 75 ? 'var(--cyan)' : score >= 60 ? 'var(--amber)' : 'var(--red)';

  ids.peakValue.textContent = `${Number.isFinite(peakDb) ? peakDb.toFixed(2) : '-∞'} dBFS`;
  ids.rmsValue.textContent = `${Number.isFinite(rmsDb) ? rmsDb.toFixed(2) : '-∞'} dBFS`;
  ids.clipValue.textContent = pct(clipPct);
  ids.stereoValue.textContent = `${stereoDb.toFixed(1)} dB ${stereoDb > 0.7 ? louder : ''}`.trim();
  ids.silenceValue.textContent = pct(silencePct);
  ids.dynamicValue.textContent = `${crest.toFixed(1)} dB`;

  const peakState = peakDb >= -0.25 ? 'bad' : peakDb >= -1 ? 'warn' : 'ok';
  const clipState = clipPct > 0.02 ? 'warn' : 'ok';
  const rmsState = rmsDb > -7 || rmsDb < -24 ? 'bad' : (rmsDb > -9 || rmsDb < -18 ? 'warn' : 'ok');
  const stereoState = stereoDb > 4 ? 'bad' : (stereoDb > 2 ? 'warn' : 'ok');
  const silenceState = silencePct > 18 ? 'bad' : (silencePct > 8 ? 'warn' : 'ok');
  const dynamicState = crest < 6 ? 'bad' : (crest < 8 ? 'warn' : 'ok');

  setFill('peakFill', clamp(100 + peakDb * 10, 0, 100), peakState);
  setFill('rmsFill', clamp((rmsDb + 30) * 4, 0, 100), rmsState);
  setFill('clipFill', clamp(clipPct * 60, clipPct > 0 ? 2 : 1, 100), clipState);
  setFill('stereoFill', clamp(stereoDb * 18, 2, 100), stereoState);
  setFill('silenceFill', clamp(silencePct * 3, 2, 100), silenceState);
  setFill('dynamicFill', clamp(crest * 5, 0, 100), dynamicState);

  ids.peakText.textContent = peakDb >= -1 ? 'Highest sample peak. Too close to ceiling — leave more headroom.' : 'Highest sample peak. Headroom looks safer for re-encoding.';
  ids.rmsText.textContent = rmsDb > -9 ? 'Average perceived loudness. Loud range — check limiter pressure.' : rmsDb < -18 ? 'Average perceived loudness. Quiet range — compare references.' : 'Average perceived loudness. Useful range for a rough check.';
  ids.clipText.textContent = clipPct > 0.02 ? 'Samples near digital ceiling. Possible clipping or limiter stress detected.' : 'Samples near digital ceiling. Lower values are safer — this looks clean.';
  ids.stereoText.textContent = stereoDb > 2 ? 'Left/right energy balance. Check panning or stereo widening.' : 'Left/right energy balance. Center looks reasonably stable.';
  ids.silenceText.textContent = silencePct > 8 ? 'Very quiet sections. High values may indicate gaps or long silence.' : 'Very quiet sections. No excessive silence detected.';
  ids.dynamicText.textContent = crest < 8 ? 'Peak-to-average movement. It may feel heavily limited.' : 'Peak-to-average movement. The track keeps natural movement.';

  metricCards.forEach((card, i) => {
    card.classList.remove('appear');
    void card.offsetWidth;
    card.style.animationDelay = `${i * 65}ms`;
    card.classList.add('appear');
  });

  const good = [];
  const fix = [];
  if (clipPct <= 0.02) good.push('No clipping-like samples detected.');
  if (rmsDb <= -9 && rmsDb >= -18) good.push('Rough RMS is in a usable listening range.');
  else fix.push(rmsDb > -9 ? 'RMS is very loud. Check limiter gain and listening fatigue.' : 'RMS is quiet. Compare loudness with a trusted reference track.');
  if (stereoDb <= 2) good.push('Stereo energy is reasonably centered.');
  else fix.push(`${stereoDb.toFixed(1)} dB ${louder}. Check panning, wideners, or exported channel balance.`);
  if (silencePct <= 8) good.push('No excessive silence or low-audio sections detected.');
  else fix.push('Excessive low/silent audio detected. Trim dead space or check intro/outro levels.');
  if (crest >= 8) good.push('Dynamic feel looks healthy — the track keeps natural movement.');
  else fix.push('Dynamic feel looks flat. Reduce compression or limiter pressure if it sounds crushed.');
  if (peakDb >= -1) fix.unshift('Peak is too close to 0 dBFS. Lower master output by 1–2 dB.');
  else good.unshift('Peak headroom looks safer for upload and re-encoding.');
  if (clipPct > 0.02) fix.push('Clipping-like samples were found. Check loud chorus, 808s, snare hits, or limiter ceiling.');
  if (peakDb >= -1 || clipPct > 0.02) fix.push('If exporting again, set limiter ceiling around -1.0 dB to -1.2 dB.');

  renderNotes(ids.goodList, good, '✓');
  renderNotes(ids.fixList, fix.length ? fix : ['No urgent release fixes found by this rough meter.'], fix.length ? '!' : '✓');

  ids.peakPenalty.textContent = pPeak ? `-${pPeak}` : '0';
  ids.clipPenalty.textContent = pClip ? `-${pClip}` : '0';
  ids.otherPenalty.textContent = pOther ? `-${pOther}` : '0';
  ids.finalScore.textContent = `${score}/100`;
  ids.scorePath.textContent = `Score path: 100 − ${pPeak} peak ceiling − ${pClip} clipping risk − ${pOther} other checks = ${score}/100`;
  ids.noteResult.textContent = `${score}/100 · ${label}`;
  ids.noteResultText.textContent = summary;

  let reason = 'Balanced technical shape';
  let reasonText = 'No single issue dominates the score.';
  let next = 'Reference check';
  let nextText = 'Compare with a trusted track and listen on phone, headphones, and speaker.';
  if (pPeak >= pClip && pPeak > 0) {
    reason = 'Peak is pinned near 0 dBFS.';
    reasonText = 'The master ceiling is too close to digital maximum.';
    next = 'Lower ceiling';
    nextText = 'Lower master output or limiter ceiling to around -1.0 dB / -1.2 dB, then export again.';
  } else if (pClip > 0) {
    reason = 'Clipping risk';
    reasonText = 'Clipping-like samples or limiter stress were detected.';
    next = 'Check loud hits';
    nextText = 'Inspect chorus, 808s, snares, and master limiter input gain.';
  } else if (pOther > 0) {
    reason = 'Balance / loudness check';
    reasonText = 'One or more supporting technical checks lowered the score.';
    next = 'Small mix pass';
    nextText = 'Check RMS, stereo balance, silence, and compression against a reference.';
  }
  ids.noteReason.textContent = reason;
  ids.noteReasonText.textContent = reasonText;
  ids.noteNext.textContent = next;
  ids.noteNextText.textContent = nextText;

  calcRow.classList.remove('run');
  void calcRow.offsetWidth;
  calcRow.classList.add('run');
  drawWaveform(buffer);
}

function renderNotes(list, notes, icon) {
  list.innerHTML = notes.map((note, index) => `<li class="item-in" style="animation-delay:${index * 80}ms"><b>${icon}</b><span>${note}</span></li>`).join('');
}

drawEmptyWave();
