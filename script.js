const consent = document.querySelector("#consent");
const analyze = document.querySelector("#analyze");
const audioFile = document.querySelector("#audio-file");
const copyReport = document.querySelector("#copy-report");
const deleteAudio = document.querySelector("#delete-audio");
const reportStatus = document.querySelector("#report-status");
const progressPanel = document.querySelector("#analysis-progress");
const progressText = document.querySelector("#progress-text");
const metricPreview = document.querySelector("#local-metric-preview");
const deleteModal = document.querySelector("#delete-modal");
const cancelDelete = document.querySelector("#cancel-delete");
const confirmDelete = document.querySelector("#confirm-delete");
const storageKey = "pulseloreMeterV02Report";

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "Unknown";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "Unknown";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function percent(value) {
  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

function decibels(value) {
  if (!Number.isFinite(value) || value <= 0) return "-Infinity dBFS";
  return `${(20 * Math.log10(value)).toFixed(1)} dBFS`;
}

function estimateSilence(channelData, sampleRate, fromStart) {
  const threshold = 0.0025;
  let silentSamples = 0;

  if (fromStart) {
    for (let i = 0; i < channelData.length; i += 1) {
      if (Math.abs(channelData[i]) > threshold) break;
      silentSamples += 1;
    }
  } else {
    for (let i = channelData.length - 1; i >= 0; i -= 1) {
      if (Math.abs(channelData[i]) > threshold) break;
      silentSamples += 1;
    }
  }

  return silentSamples / sampleRate;
}

function estimateDynamicRange(mono, sampleRate) {
  const windowSize = Math.max(1024, Math.floor(sampleRate * 0.05));
  const windows = [];

  for (let start = 0; start < mono.length; start += windowSize) {
    let sumSquares = 0;
    const end = Math.min(mono.length, start + windowSize);

    for (let i = start; i < end; i += 1) {
      sumSquares += mono[i] * mono[i];
    }

    windows.push(Math.sqrt(sumSquares / Math.max(1, end - start)));
  }

  const active = windows.filter((value) => value > 0.001).sort((a, b) => a - b);
  if (active.length < 2) return 0;

  const low = active[Math.floor(active.length * 0.1)];
  const high = active[Math.floor(active.length * 0.9)];
  return Math.max(0, 20 * Math.log10(high / Math.max(low, 0.000001)));
}

function scoreFromMetrics(metrics) {
  let quality = 78;
  let readiness = 74;
  let technical = 78;

  const clippingRisk = Math.min(100, (metrics.clippedSampleRatio * 1400) + (metrics.peak > 0.995 ? 35 : 0));
  const silencePenalty = Math.min(18, (metrics.silenceStartSeconds + metrics.silenceEndSeconds) * 2);
  const balancePenalty = Number.isFinite(metrics.stereoBalancePercent)
    ? Math.min(18, Math.abs(metrics.stereoBalancePercent) * 0.8)
    : 0;
  const lowLevelPenalty = metrics.rms < 0.035 ? 12 : 0;
  const flatRangePenalty = metrics.dynamicRangeDb < 6 ? 12 : 0;

  quality -= clippingRisk * 0.35;
  quality -= silencePenalty + balancePenalty + lowLevelPenalty + flatRangePenalty;
  readiness -= clippingRisk * 0.3;
  readiness -= silencePenalty + lowLevelPenalty + (metrics.duration < 30 ? 18 : 0);
  technical -= clippingRisk * 0.42;
  technical -= balancePenalty + flatRangePenalty;

  return {
    quality: Math.round(Math.max(0, Math.min(100, quality))),
    clippingRisk: Math.round(Math.max(0, Math.min(100, clippingRisk))),
    readiness: Math.round(Math.max(0, Math.min(100, readiness))),
    technical: Math.round(Math.max(0, Math.min(100, technical)))
  };
}

async function analyzeLocalAudio(file) {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const buffer = await file.arrayBuffer();
  const audioBuffer = await context.decodeAudioData(buffer);
  await context.close();

  const channels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const mono = new Float32Array(length);
  let peak = 0;
  let sumSquares = 0;
  let clippedSamples = 0;
  let leftRms = 0;
  let rightRms = 0;

  for (let channel = 0; channel < channels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);

    for (let i = 0; i < length; i += 1) {
      const sample = data[i];
      const absolute = Math.abs(sample);
      peak = Math.max(peak, absolute);
      sumSquares += sample * sample;
      mono[i] += sample / channels;
      if (absolute >= 0.999) clippedSamples += 1;
      if (channel === 0) leftRms += sample * sample;
      if (channel === 1) rightRms += sample * sample;
    }
  }

  const firstChannel = audioBuffer.getChannelData(0);
  const rms = Math.sqrt(sumSquares / Math.max(1, length * channels));
  const clippedSampleRatio = clippedSamples / Math.max(1, length * channels);
  let stereoBalancePercent = null;

  if (channels >= 2) {
    const left = Math.sqrt(leftRms / length);
    const right = Math.sqrt(rightRms / length);
    stereoBalancePercent = ((right - left) / Math.max(0.000001, right + left)) * 100;
  }

  const metrics = {
    version: "v0.2 browser-only",
    createdAt: new Date().toISOString(),
    fileName: file.name,
    fileSize: file.size,
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channelCount: channels,
    peak,
    rms,
    clippedSampleRatio,
    silenceStartSeconds: estimateSilence(firstChannel, audioBuffer.sampleRate, true),
    silenceEndSeconds: estimateSilence(firstChannel, audioBuffer.sampleRate, false),
    dynamicRangeDb: estimateDynamicRange(mono, audioBuffer.sampleRate),
    stereoBalancePercent
  };

  return { metrics, scores: scoreFromMetrics(metrics) };
}

function renderPreview(report) {
  if (!metricPreview) return;
  const { metrics, scores } = report;

  metricPreview.innerHTML = [
    ["File", metrics.fileName],
    ["Duration", formatDuration(metrics.duration)],
    ["Peak", decibels(metrics.peak)],
    ["Audio Quality", `${scores.quality}/100`]
  ].map(([label, value]) => `<div class="mini-metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function setBar(id, width) {
  const element = document.querySelector(id);
  if (element) element.style.width = `${Math.max(0, Math.min(100, width))}%`;
}

function setText(id, text) {
  const element = document.querySelector(id);
  if (element) element.textContent = text;
}

function renderReport() {
  const metricsRoot = document.querySelector("#browser-metrics");
  if (!metricsRoot) return;

  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  const report = JSON.parse(saved);
  const { metrics, scores } = report;
  const balance = Number.isFinite(metrics.stereoBalancePercent)
    ? `${metrics.stereoBalancePercent.toFixed(1)}% ${metrics.stereoBalancePercent >= 0 ? "right" : "left"} leaning`
    : "Mono or unavailable";

  metricsRoot.innerHTML = [
    ["File name", metrics.fileName],
    ["File size", formatBytes(metrics.fileSize)],
    ["Duration", formatDuration(metrics.duration)],
    ["Sample rate", `${metrics.sampleRate.toLocaleString()} Hz`],
    ["Channel count", String(metrics.channelCount)],
    ["Peak level estimate", decibels(metrics.peak)],
    ["RMS level estimate", decibels(metrics.rms)],
    ["Clipping risk estimate", `${scores.clippingRisk}/100 from ${percent(metrics.clippedSampleRatio * 100)} clipped/near-clipped samples`],
    ["Silence at start/end estimate", `${metrics.silenceStartSeconds.toFixed(2)}s start / ${metrics.silenceEndSeconds.toFixed(2)}s end`],
    ["Basic dynamic range estimate", `${metrics.dynamicRangeDb.toFixed(1)} dB`],
    ["Stereo balance estimate", balance]
  ].map(([label, value]) => `<div class="detail-item"><strong>${label}</strong><span>${value}</span></div>`).join("");

  setText("#report-title", scores.clippingRisk > 55 ? "Technical issues detected - manual review recommended" : "Basic release-readiness check complete");
  setText("#prototype-duration", `${formatDuration(metrics.duration)} real browser duration; AI/Human/Hybrid details remain prototype estimates.`);
  setBar("#quality-bar", scores.quality);
  setBar("#clipping-bar", scores.clippingRisk);
  setBar("#readiness-bar", scores.readiness);
  setBar("#technical-bar", scores.technical);
  setText("#quality-text", `${scores.quality}/100 based on local peak, RMS, clipping, silence, dynamic range, and stereo balance estimates.`);
  setText("#clipping-text", scores.clippingRisk > 55 ? "High risk. Lower the master level and re-export before release." : "No severe clipping pattern detected by the browser meter.");
  setText("#readiness-text", `${scores.readiness}/100 basic technical release-readiness estimate. Manual review recommended.`);
  setText("#technical-text", `${scores.technical}/100 browser-only technical check. This does not replace mastering QA.`);

  const scoreCircle = document.querySelector(".score-circle");
  if (scoreCircle) {
    scoreCircle.textContent = `${scores.quality}%`;
    scoreCircle.style.background = `conic-gradient(var(--blue) 0 ${scores.quality}%, rgba(255,255,255,0.08) ${scores.quality}% 100%)`;
  }
}

if (consent && analyze) {
  analyze.setAttribute("aria-disabled", "true");

  consent.addEventListener("change", () => {
    analyze.setAttribute("aria-disabled", String(!consent.checked));
  });

  analyze.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!consent.checked) return;

    analyze.setAttribute("aria-disabled", "true");
    progressPanel?.classList.add("is-visible");

    if (!audioFile?.files?.length) {
      progressText.textContent = "Choose an MP3, WAV, or FLAC file to calculate real browser audio metrics. Song links stay as future backend placeholders.";
      analyze.setAttribute("aria-disabled", "false");
      return;
    }

    try {
      progressText.textContent = "Decoding selected audio locally in this browser. Nothing is uploaded.";
      const report = await analyzeLocalAudio(audioFile.files[0]);
      localStorage.setItem(storageKey, JSON.stringify(report));
      renderPreview(report);
      progressText.textContent = "Local browser metrics complete. Opening report...";

      setTimeout(() => {
        window.location.href = "../report/";
      }, 900);
    } catch (error) {
      progressText.textContent = "This browser could not decode the selected file. Try a WAV or MP3 export, then run the meter again.";
      analyze.setAttribute("aria-disabled", "false");
    }
  });
}

if (copyReport) {
  copyReport.addEventListener("click", async () => {
    const saved = localStorage.getItem(storageKey);
    const report = saved ? JSON.parse(saved) : null;
    const metricLines = report ? [
      `File: ${report.metrics.fileName}`,
      `Duration: ${formatDuration(report.metrics.duration)}`,
      `Peak: ${decibels(report.metrics.peak)}`,
      `RMS: ${decibels(report.metrics.rms)}`,
      `Audio Quality Score: ${report.scores.quality}/100`,
      `Clipping Risk: ${report.scores.clippingRisk}/100`,
      `Basic Release Readiness: ${report.scores.readiness}/100`
    ] : ["No real browser metrics saved yet."];

    const text = [
      "PulseLore AI Music Meter v0.2 - Browser-only beta report",
      ...metricLines,
      "Prototype estimate: Hybrid characteristics detected",
      "AI-like percentage: 46%",
      "Human-like percentage: 38%",
      "Inconclusive percentage: 16%",
      "Note: Real metrics are local browser estimates. AI/Human/Hybrid and rights notes are prototype risk estimates only."
    ].join("\n");

    await navigator.clipboard.writeText(text);
    reportStatus.textContent = "Report copied to clipboard.";
  });
}

if (deleteAudio) {
  deleteAudio.addEventListener("click", () => {
    deleteModal?.classList.add("is-open");
  });
}

if (cancelDelete) {
  cancelDelete.addEventListener("click", () => {
    deleteModal?.classList.remove("is-open");
  });
}

if (confirmDelete) {
  confirmDelete.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    deleteModal?.classList.remove("is-open");
    reportStatus.textContent = "Local browser report data removed from this browser. No audio was uploaded to PulseLore.Studio.";
    deleteAudio.disabled = true;
  });
}

renderReport();
