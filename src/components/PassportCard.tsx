import { useEffect, useState } from 'react'
import * as QRCode from 'qrcode'
import { artist, passport, studioWebsite, track } from '../data/passport'
import { verificationBaseUrl } from '../config'

export type CardFormat = 'portrait' | 'square'
export type CardImageFormat = 'png' | 'jpg'

type CardSpec = {
  format: CardFormat
  label: string
  width: number
  height: number
}

const cardSpecs: Record<CardFormat, CardSpec> = {
  portrait: { format: 'portrait', label: 'Portrait · 1080 × 1350', width: 1080, height: 1350 },
  square: { format: 'square', label: 'Square · 1080 × 1080', width: 1080, height: 1080 },
}

const logoAsset = '/assets/pulselore-studio-logo.png'
const verificationUrl = `${verificationBaseUrl.replace(/\/$/, '')}/verify/${passport.id}`

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function drawCoverContained(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  ctx.fillStyle = '#0a1424'
  ctx.fillRect(x, y, size, size)
  const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight)
  const width = image.naturalWidth * scale
  const height = image.naturalHeight * scale
  ctx.drawImage(image, x + (size - width) / 2, y + (size - height) / 2, width, height)
}

function drawLogo(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  ctx.drawImage(image, x, y, size, size)
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 17, color = '#76b8ff') {
  ctx.fillStyle = color
  ctx.font = `500 ${size}px "Courier New", monospace`
  ctx.letterSpacing = '2px'
  ctx.fillText(text.toUpperCase(), x, y)
  ctx.letterSpacing = '0px'
}

function drawBody(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size = 24, color = '#e9efdc') {
  ctx.fillStyle = color
  ctx.font = `500 ${size}px Arial, sans-serif`
  ctx.fillText(text, x, y)
}

function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, size: number, color: string) {
  ctx.fillStyle = color
  ctx.font = `500 ${size}px Arial, sans-serif`
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      currentY += lineHeight
      line = word
    } else {
      line = candidate
    }
  }
  if (line) ctx.fillText(line, x, currentY)
  return currentY
}

function drawQr(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  ctx.fillStyle = '#e9efdc'
  ctx.fillRect(x - 14, y - 14, size + 28, size + 28)
  ctx.drawImage(image, x, y, size, size)
}

async function renderCard(format: CardFormat, imageFormat: CardImageFormat) {
  const spec = cardSpecs[format]
  const canvas = document.createElement('canvas')
  canvas.width = spec.width
  canvas.height = spec.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported in this browser.')

  const [coverImage, logoImage, qrDataUrl] = await Promise.all([
    loadImage(track.coverAsset),
    loadImage(logoAsset),
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 520,
      color: { dark: '#060b15', light: '#e9efdc' },
    }),
  ])
  const qrImage = await loadImage(qrDataUrl)

  ctx.fillStyle = '#060b15'
  ctx.fillRect(0, 0, spec.width, spec.height)
  ctx.strokeStyle = '#24466f'
  ctx.lineWidth = 2
  ctx.strokeRect(34, 34, spec.width - 68, spec.height - 68)

  if (format === 'portrait') {
    drawLabel(ctx, 'PULSELORE TRACK PASSPORT', 74, 88, 16)
    drawLogo(ctx, logoImage, 860, 52, 132)
    drawCoverContained(ctx, coverImage, 110, 132, 860)
    drawLabel(ctx, 'PRODUCTION RECORD', 110, 1050, 16)
    ctx.fillStyle = '#e9efdc'
    ctx.font = '600 58px Georgia, serif'
    ctx.fillText('STAY IN THE BLUE', 110, 1110)
    ctx.font = '500 25px Arial, sans-serif'
    ctx.fillText('THE 404 PAGES', 110, 1150)
    ctx.strokeStyle = '#2e75c9'
    ctx.lineWidth = 5
    ctx.beginPath(); ctx.moveTo(110, 1180); ctx.lineTo(390, 1180); ctx.stroke()
    drawLabel(ctx, `PASSPORT ID  ${passport.id}`, 110, 1220, 14, '#aeb9c8')
    drawLabel(ctx, `ISRC  ${passport.isrc}`, 110, 1250, 14, '#aeb9c8')
    drawLabel(ctx, 'RELEASED  ·  APRIL 1, 2026', 110, 1280, 14, '#aeb9c8')
    drawQr(ctx, qrImage, 830, 1170, 150)
    drawLabel(ctx, 'SCAN TO VIEW OFFICIAL PRODUCTION RECORD', 110, 1318, 12, '#76b8ff')
  } else {
    drawLogo(ctx, logoImage, 72, 62, 150)
    drawLabel(ctx, 'PULSELORE TRACK PASSPORT', 260, 101, 16)
    drawCoverContained(ctx, coverImage, 72, 245, 560)
    drawLabel(ctx, 'PRODUCTION RECORD', 700, 270, 16)
    ctx.fillStyle = '#e9efdc'
    ctx.font = '600 48px Georgia, serif'
    drawWrapped(ctx, 'STAY IN THE BLUE', 700, 330, 300, 58, 48, '#e9efdc')
    ctx.font = '500 24px Arial, sans-serif'
    ctx.fillText('THE 404 PAGES', 700, 465)
    ctx.strokeStyle = '#2e75c9'; ctx.lineWidth = 5
    ctx.beginPath(); ctx.moveTo(700, 495); ctx.lineTo(930, 495); ctx.stroke()
    drawLabel(ctx, 'PASSPORT ID', 700, 555, 14, '#aeb9c8')
    drawBody(ctx, passport.id, 700, 590, 21, '#76b8ff')
    drawLabel(ctx, 'ISRC', 700, 640, 14, '#aeb9c8')
    drawBody(ctx, passport.isrc, 700, 675, 21, '#76b8ff')
    drawLabel(ctx, 'STATUS', 700, 725, 14, '#aeb9c8')
    drawBody(ctx, 'Released', 700, 760, 24)
    drawLabel(ctx, 'PRODUCED THROUGH PULSELORE STUDIO', 72, 875, 15)
    ctx.fillStyle = '#e9efdc'; ctx.font = '500 28px Georgia, serif'
    ctx.fillText('Production Record Verified by', 72, 930)
    ctx.fillText('PulseLore Studio', 72, 970)
    drawQr(ctx, qrImage, 720, 835, 220)
    drawLabel(ctx, 'SCAN TO VIEW OFFICIAL PRODUCTION RECORD', 72, 1025, 13)
  }

  const mime = imageFormat === 'jpg' ? 'image/jpeg' : 'image/png'
  const quality = imageFormat === 'jpg' ? .94 : undefined
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Unable to create export.')), mime, quality))
  return { blob, spec }
}

export function PassportCardPreview({ format }: { format: CardFormat }) {
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 512,
      color: { dark: '#060b15', light: '#e9efdc' },
    }).then((url) => { if (active) setQrDataUrl(url) })
    return () => { active = false }
  }, [])

  return (
    <article className={`passport-card passport-card-${format}`} aria-label={`${cardSpecs[format].label} Passport Card preview`}>
      <div className="passport-card-topline">
        <span>PULSELORE TRACK PASSPORT</span>
        <img src={logoAsset} alt="PulseLore Studio official logo" />
      </div>
      <div className="passport-card-art"><img src={track.coverAsset} alt="Stay In The Blue official cover artwork" /></div>
      <div className="passport-card-copy">
        <span className="eyebrow">Production record</span>
        <h2>Stay In The Blue</h2>
        <p className="passport-card-artist">The 404 Pages</p>
        <div className="passport-card-rule" />
        <div className="passport-card-meta">
          <div><span>Passport ID</span><strong>{passport.id}</strong></div>
          <div><span>ISRC</span><strong>{passport.isrc}</strong></div>
          <div><span>Status</span><strong>Released</strong></div>
        </div>
        <p className="passport-card-produced">Produced through PulseLore Studio</p>
        <p className="passport-card-verified">Production Record Verified by PulseLore Studio</p>
      </div>
      <div className="passport-card-qr">
        {qrDataUrl ? <img src={qrDataUrl} alt="QR code linking to the official preview production record" /> : <span className="qr-loading">Generating QR</span>}
        <span>Scan to view official production record</span>
      </div>
      <div className="passport-card-footer"><span>PulseLore Studio</span><span>{verificationBaseUrl.replace(/^https?:\/\//, '')}</span></div>
    </article>
  )
}

export function PassportCardActions() {
  const [status, setStatus] = useState('')

  async function handleDownload(format: CardFormat, imageFormat: CardImageFormat) {
    setStatus(`Preparing ${cardSpecs[format].label} ${imageFormat.toUpperCase()}…`)
    try {
      const { blob, spec } = await renderCard(format, imageFormat)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `pulselore-track-passport-${passport.id}-${format}.${imageFormat}`
      anchor.click()
      URL.revokeObjectURL(url)
      setStatus(`${spec.label} ${imageFormat.toUpperCase()} downloaded.`)
    } catch {
      setStatus('Export could not be generated in this browser.')
    }
  }

  return (
    <div className="card-actions">
      <div className="card-action-heading">
        <span className="eyebrow">Download formats</span>
        <p>Real QR destination: <code>{verificationUrl}</code></p>
      </div>
      <div className="card-action-row">
        <button type="button" onClick={() => handleDownload('portrait', 'png')}>PNG · 1080 × 1350</button>
        <button type="button" onClick={() => handleDownload('square', 'png')}>PNG · 1080 × 1080</button>
        <button type="button" onClick={() => handleDownload('portrait', 'jpg')}>JPG · Portrait</button>
      </div>
      <span className="card-action-status" role="status" aria-live="polite">{status}</span>
    </div>
  )
}

export { cardSpecs, verificationUrl, studioWebsite }
