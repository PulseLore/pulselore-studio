import type { ReactNode } from 'react'
import { CreditList } from './components/CreditList'
import { OfficialLinks } from './components/OfficialLinks'
import { PassportCardActions, PassportCardPreview, verificationUrl } from './components/PassportCard'
import { RouteRail } from './components/RouteRail'
import { SectionHeading } from './components/SectionHeading'
import { artist, credits, officialLinks, passport, studioWebsite, track, getCredit } from './data/passport'

const verificationPath = `/verify/${passport.id}`
const cardPath = `/card/${passport.id}`
const logoAsset = '/assets/pulselore-studio-logo.png'

function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>
}

function MetaItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="meta-item">
      <span className="eyebrow">{label}</span>
      <strong className={mono ? 'mono' : ''}>{value}</strong>
    </div>
  )
}

function SiteHeader({ context = 'PUBLIC RECORD' }: { context?: string }) {
  return (
    <header className="site-header">
      <a className="brand-lockup" href={verificationPath} aria-label="PulseLore Track Passport home">
        <img src={logoAsset} alt="PulseLore Studio official logo" />
        <span><b>PulseLore</b><em>Track Passport</em></span>
      </a>
      <div className="header-context">
        <span className="status-dot" />
        <span>{context}</span>
        <span className="header-slash">/</span>
        <span>01 / 01</span>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer verification-footer">
      <div className="footer-brand">
        <img src={logoAsset} alt="PulseLore Studio official logo" />
        <span>Issued by PulseLore Studio</span>
      </div>
      <div className="footer-verification">
        <strong>Production Record Verified by PulseLore Studio</strong>
        <span>Passport ID: <b>{passport.id}</b></span>
        <span>ISRC: <b>{passport.isrc}</b></span>
      </div>
      <ExternalLink className="footer-domain" href={`https://${passport.verificationDomain}`}>{passport.verificationDomain} ↗</ExternalLink>
    </footer>
  )
}

function NotFoundState() {
  return (
    <div className="app simple-page">
      <div className="grain" aria-hidden="true" />
      <SiteHeader context="NO MATCH" />
      <main className="not-found-shell">
        <span className="eyebrow">Verification error / 404</span>
        <h1>Track Passport<br /><em>Not Found</em></h1>
        <p>No PulseLore Studio production record matches this Passport ID.</p>
        <a className="primary-button" href={verificationPath}>Open the first Passport <span aria-hidden="true">↗</span></a>
      </main>
    </div>
  )
}

function RootLanding() {
  return (
    <div className="app simple-page root-page">
      <div className="grain" aria-hidden="true" />
      <SiteHeader context="PREVIEW INDEX" />
      <main className="root-shell">
        <div className="root-copy">
          <span className="eyebrow">A public production provenance archive</span>
          <h1>PulseLore<br /><em>Track Passport</em></h1>
          <p>Read the production record behind a finished track: the writing, performance, source stage and studio pass.</p>
          <a className="primary-button" href={verificationPath}>View Stay In The Blue — The 404 Pages <span aria-hidden="true">↗</span></a>
        </div>
        <a className="root-track-link" href={verificationPath}>
          <img src={track.coverAsset} alt="Stay In The Blue cover artwork by The 404 Pages" />
          <span><small>01 / first passport</small><strong>Stay In The Blue</strong><em>The 404 Pages</em></span>
        </a>
      </main>
    </div>
  )
}

function StudioSection() {
  return (
    <section className="record-section studio-section" id="studio">
      <div className="studio-section-content">
        <div className="studio-section-copy">
          <span className="eyebrow">10 — Studio identity</span>
          <h2>Made through<br /><em>PulseLore Studio</em></h2>
          <p>Music production, arrangement, creative technology and artist-focused digital work.</p>
          <div className="studio-ctas">
            <ExternalLink className="primary-button" href={studioWebsite}>Explore PulseLore Studio <span aria-hidden="true">↗</span></ExternalLink>
            <ExternalLink className="text-button" href={studioWebsite}>Work With PulseLore Studio <span aria-hidden="true">↗</span></ExternalLink>
          </div>
        </div>
        <img className="studio-logo" src={logoAsset} alt="PulseLore Studio official logo" />
      </div>
    </section>
  )
}

function PassportPage() {
  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />
      <SiteHeader />

      <main className="passport-shell">
        <div className="desktop-grid">
          <aside className="identity-column">
            <div className="cover-frame">
              <div className="cover-index"><span>PL</span><span>001</span></div>
              <figure className="cover-art">
                <img src={track.coverAsset} alt="Stay In The Blue cover artwork by The 404 Pages" />
                <figcaption>
                  <span>Official cover artwork</span>
                  <span>Stay In The Blue / 2026</span>
                </figcaption>
              </figure>
            </div>

            <div className="identity-copy">
              <p className="kicker">Production Record</p>
              <h1>{track.title}</h1>
              <p className="artist-line">{artist.name}</p>
              <p className="identity-description">A production provenance record showing how this recording was written, performed, developed and finalized.</p>
            </div>

            <div className="identity-meta">
              <MetaItem label="Passport ID" value={passport.id} mono />
              <MetaItem label="ISRC" value={passport.isrc} mono />
              <MetaItem label="Release status" value={passport.releaseStatus} />
              <MetaItem label="Release date" value={passport.releaseDate} />
            </div>

            <ExternalLink className="artist-profile-link" href={artist.profileUrl}>
              <span>View Artist Profile</span><span aria-hidden="true">↗</span>
            </ExternalLink>

            <div className="identity-footnote">
              <span className="eyebrow">Record class</span>
              <p>Independent music archive<br />Production documentation</p>
            </div>
          </aside>

          <div className="record-column">
            <div className="record-intro">
              <span className="eyebrow">01 — Track identity</span>
              <p className="intro-quote">“The record is the route: the people, tools and decisions that brought a song into focus.”</p>
            </div>

            <section className="record-section section-writing" id="writing">
              <SectionHeading number="02" eyebrow="Writing & composition" title="The first line" />
              <div className="single-credit">
                <span className="eyebrow">Songwriter / Composer</span>
                <strong>{getCredit('Songwriter / Composer')?.person}</strong>
                <span className="credit-rule" />
                <p>Originating the song's written form and composition.</p>
              </div>
            </section>

            <section className="record-section" id="performance">
              <SectionHeading number="03" eyebrow="Performance" title="The human take" />
              <div className="performance-grid">
                <div className="performance-artist">
                  <span className="eyebrow">Artist</span>
                  <strong>{artist.name}</strong>
                  <p>The recording artist identity remains distinct from the individual performance credit.</p>
                </div>
                <div className="performance-detail">
                  <MetaItem label="Lead vocals" value={getCredit('Lead Vocals')?.person ?? 'Pending'} />
                  <MetaItem label="Vocal recording" value={getCredit('Vocal Recording')?.person ?? 'Pending'} />
                </div>
              </div>
              <ExternalLink className="inline-profile-link" href={artist.profileUrl}>View Artist Profile <span aria-hidden="true">↗</span></ExternalLink>
            </section>

            <section className="record-section source-section" id="source">
              <SectionHeading number="04" eyebrow="Source" title="The starting signal" />
              <div className="source-note">
                <span className="source-stamp">AI source</span>
                <div>
                  <span className="eyebrow">AI Demo / Source Stems</span>
                  <strong>{getCredit('AI Demo / Source Stems')?.person}</strong>
                  <p>{getCredit('AI Demo / Source Stems')?.note}</p>
                </div>
              </div>
              <p className="source-clarifier">Suno is documented here as the initial demo/source stage. The final recording, performance and production credits are recorded separately below.</p>
            </section>

            <section className="record-section" id="production">
              <SectionHeading number="05" eyebrow="Production record" title="The studio pass" />
              <CreditList credits={credits.filter((credit) => ['Arrangement', 'Re-Production', 'Instrumentation', 'Music Production', 'Vocal Production', 'Mixing', 'Mastering', 'DAW', 'Production Studio'].includes(credit.role))} />
            </section>

            <section className="record-section route-section" id="route">
              <SectionHeading number="06" eyebrow="Creation route" title="From signal to master" />
              <RouteRail />
            </section>

            <section className="record-section release-section" id="release">
              <SectionHeading number="07" eyebrow="Release record" title="Filed and released" />
              <div className="release-grid">
                <MetaItem label="Release status" value={passport.releaseStatus} />
                <MetaItem label="Release date" value={passport.releaseDate} />
                <MetaItem label="ISRC" value={passport.isrc} mono />
                <MetaItem label="Passport ID" value={passport.id} mono />
              </div>
            </section>

            <section className="record-section links-section" id="links">
              <SectionHeading number="08" eyebrow="Official links" title="Hear the record" />
              <div className="primary-listen">
                <span className="eyebrow">Primary streaming link</span>
                <ExternalLink href={officialLinks[0].href}>Stay In The Blue on Spotify <span aria-hidden="true">↗</span></ExternalLink>
              </div>
              <OfficialLinks links={officialLinks.slice(1)} />
            </section>

            <StudioSection />

            <section className="record-section verification-section" id="verification">
              <SectionHeading number="11" eyebrow="Official verification" title="The record is on file" />
              <div className="verification-layout">
                <div className="verification-copy">
                  <div className="verification-seal"><span className="status-dot" />{passport.issuedBy}</div>
                  <h3>{passport.verifiedLabel}</h3>
                  <p>This public passport documents production provenance for this recording. It is not legal copyright certification or ownership certification.</p>
                  <div className="verification-meta">
                    <MetaItem label="Passport" value={passport.id} mono />
                    <MetaItem label="ISRC" value={passport.isrc} mono />
                    <MetaItem label="Official studio" value="pulselore.studio" mono />
                  </div>
                </div>
                <a className="card-cta" href={cardPath}>
                  <span className="eyebrow">Shareable asset</span>
                  <strong>View / Download<br />Passport Card</strong>
                  <span className="card-cta-arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </section>

            <SiteFooter />
          </div>
        </div>
      </main>
    </div>
  )
}

function PassportCardPage() {
  return (
    <div className="app card-page">
      <div className="grain" aria-hidden="true" />
      <SiteHeader context="SHAREABLE ASSET" />
      <main className="card-page-shell">
        <div className="card-page-heading">
          <div>
            <span className="eyebrow">Passport card / {passport.id}</span>
            <h1>Stay In The Blue<br /><em>Passport Card</em></h1>
            <p>A premium shareable record for social posts, press, artist pages and websites. Detailed credits remain on the official verification page.</p>
          </div>
          <a className="text-button" href={verificationPath}>Back to verification page <span aria-hidden="true">↗</span></a>
        </div>
        <div className="card-preview-grid">
          <div><span className="eyebrow">Portrait social post</span><PassportCardPreview format="portrait" /></div>
          <div><span className="eyebrow">Square social post</span><PassportCardPreview format="square" /></div>
        </div>
        <PassportCardActions />
          <p className="card-page-note">This Card QR encodes the official production verification URL: <code>{verificationUrl}</code></p>
      </main>
    </div>
  )
}

export function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path === '/') return <RootLanding />
  if (path === verificationPath) return <PassportPage />
  if (path === cardPath) return <PassportCardPage />
  if (path.startsWith('/verify/') || path.startsWith('/card/')) return <NotFoundState />
  return <NotFoundState />
}
