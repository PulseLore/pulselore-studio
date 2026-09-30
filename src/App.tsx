import type { ReactNode } from 'react'
import { CreditList } from './components/CreditList'
import { OfficialLinks } from './components/OfficialLinks'
import { QrPlaceholder } from './components/QrPlaceholder'
import { RouteRail } from './components/RouteRail'
import { SectionHeading } from './components/SectionHeading'
import { artist, credits, officialLinks, passport, track, getCredit } from './data/passport'

const verificationPath = `/verify/${passport.id}`

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

export function App() {
  const path = window.location.pathname
  const isVerificationRoute = path === verificationPath || path.startsWith('/verify/')

  return (
    <div className="app">
      <div className="grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand-lockup" href={verificationPath} aria-label="PulseLore Track Passport home">
          <img src="/icons/pulselore-passport-mark.png" alt="" />
          <span><b>PulseLore</b><em>Track Passport</em></span>
        </a>
        <div className="header-context">
          <span className="status-dot" />
          <span>{isVerificationRoute ? 'PUBLIC RECORD' : 'PREVIEW RECORD'}</span>
          <span className="header-slash">/</span>
          <span>01 / 01</span>
        </div>
      </header>

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
              <p className="section-deck">A restrained production journey, kept in the order the work moved through the room.</p>
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

            <section className="record-section verification-section" id="verification">
              <SectionHeading number="09" eyebrow="Official verification" title="The record is on file" />
              <div className="verification-layout">
                <div className="verification-copy">
                  <div className="verification-seal"><span className="status-dot" />{passport.issuedBy}</div>
                  <h3>{passport.verifiedLabel}</h3>
                  <p>This public passport documents production provenance for this recording. It is not legal copyright certification or ownership certification.</p>
                  <div className="verification-meta">
                    <MetaItem label="Passport" value={passport.id} mono />
                    <MetaItem label="ISRC" value={passport.isrc} mono />
                    <MetaItem label="Future official domain" value={passport.verificationDomain} mono />
                  </div>
                </div>
                <QrPlaceholder />
              </div>
            </section>

            <footer className="site-footer">
              <span>PulseLore Studio</span>
              <span>Production Record Verified</span>
              <span className="mono">{passport.id}</span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  )
}
