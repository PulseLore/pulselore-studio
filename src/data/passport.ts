export type Credit = {
  role: string
  person: string
  note?: string
}

export type OfficialLink = {
  label: string
  shortLabel: string
  href: string
  icon: 'spotify' | 'youtube' | 'tiktok' | 'facebook' | 'soundcloud'
  primary?: boolean
}

export type Artist = {
  id: string
  name: string
  profileUrl: string
}

export type Track = {
  id: string
  title: string
  artistId: string
  coverAsset: string
}

export type TrackPassport = {
  id: string
  trackId: string
  isrc: string
  releaseStatus: string
  releaseDate: string
  verificationDomain: string
  issuedBy: string
  verifiedLabel: string
}

export const studioWebsite = 'https://pulselore.studio/'

export const artist: Artist = {
  id: 'the-404-pages',
  name: 'The 404 Pages',
  profileUrl: 'https://zen.pulselore.studio/#the-404-pages',
}

export const track: Track = {
  id: 'stay-in-the-blue',
  title: 'Stay In The Blue',
  artistId: artist.id,
  coverAsset: '/assets/stay-in-the-blue-cover.webp',
}

export const passport: TrackPassport = {
  id: 'PL-404-STB-001',
  trackId: track.id,
  isrc: 'GX3HH2667730',
  releaseStatus: 'Released',
  releaseDate: 'April 1, 2026',
  verificationDomain: 'passport.pulselore.studio',
  issuedBy: 'PulseLore Studio',
  verifiedLabel: 'Production Record Verified by PulseLore Studio',
}

export const credits: Credit[] = [
  { role: 'Songwriter / Composer', person: 'Zen' },
  { role: 'Artist', person: artist.name },
  { role: 'Lead Vocals', person: 'Zen' },
  { role: 'Vocal Recording', person: 'Zen' },
  { role: 'AI Demo / Source Stems', person: 'Suno', note: 'Used during the initial demo and source-stem stage of production.' },
  { role: 'Arrangement', person: 'PulseLore Studio' },
  { role: 'Re-Production', person: 'PulseLore Studio' },
  { role: 'Instrumentation', person: 'PulseLore Studio' },
  { role: 'Music Production', person: 'PulseLore Studio' },
  { role: 'Vocal Production', person: 'PulseLore Studio' },
  { role: 'Mixing', person: 'PulseLore Studio' },
  { role: 'Mastering', person: 'PulseLore Studio' },
  { role: 'DAW', person: 'PreSonus Studio One' },
  { role: 'Production Studio', person: 'PulseLore Studio' },
]

export const officialLinks: OfficialLink[] = [
  {
    label: 'Spotify — Stay In The Blue',
    shortLabel: 'Stay In The Blue',
    href: 'https://open.spotify.com/track/2hHs27701QuA0GXHb8pr7E',
    icon: 'spotify',
    primary: true,
  },
  {
    label: 'Spotify — The 404 Pages',
    shortLabel: 'The 404 Pages',
    href: 'https://open.spotify.com/artist/5N9urrOoHV4exoNeB3YQ5U',
    icon: 'spotify',
  },
  {
    label: 'YouTube',
    shortLabel: 'The 404 Pages',
    href: 'https://www.youtube.com/@The404Pages',
    icon: 'youtube',
  },
  {
    label: 'TikTok',
    shortLabel: '@the_404_pages',
    href: 'https://www.tiktok.com/@the_404_pages',
    icon: 'tiktok',
  },
  {
    label: 'Facebook',
    shortLabel: 'The 404 Pages',
    href: 'https://www.facebook.com/the404pages/',
    icon: 'facebook',
  },
  {
    label: 'SoundCloud',
    shortLabel: 'The 404 Pages',
    href: 'https://on.soundcloud.com/rFlEdhQuXdaJvvP69g',
    icon: 'soundcloud',
  },
]

export const productionRoute = [
  { name: 'Zen', role: 'Songwriting / Composition', kind: 'human' },
  { name: 'Suno', role: 'AI Demo / Source Stems', kind: 'source' },
  { name: 'PulseLore Studio', role: 'Arrangement / Re-Production / Instrumentation', kind: 'studio' },
  { name: 'Zen', role: 'Lead Vocals / Vocal Recording', kind: 'human' },
  { name: 'PulseLore Studio', role: 'Vocal Production / Mixing / Mastering', kind: 'studio' },
] as const

export const getCredit = (role: string) => credits.find((credit) => credit.role === role)
