type PlatformIconProps = {
  name: 'spotify' | 'youtube' | 'tiktok' | 'facebook' | 'soundcloud'
}

export function PlatformIcon({ name }: PlatformIconProps) {
  if (name === 'spotify') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M7.5 9.7c2.9-.7 6.7-.4 9.2.8M8.3 12.4c2.4-.5 5.5-.2 7.7.8M9.1 15c1.8-.3 4.2-.1 5.9.6" fill="none" stroke="#07101d" strokeWidth="1.35" strokeLinecap="round" /></svg>
  }
  if (name === 'youtube') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3.5" fill="currentColor" /><path d="m10 9 5 3-5 3V9Z" fill="#07101d" /></svg>
  }
  if (name === 'tiktok') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.3 4.5v9.1a3.9 3.9 0 1 1-3.2-3.8v2.6a1.4 1.4 0 1 0 1.5 1.4V4.5h2.1c.3 1.4 1.1 2.4 2.8 2.9v2.1c-1.2-.2-2.3-.7-3.2-1.5v3.5" fill="currentColor" /></svg>
  }
  if (name === 'facebook') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" /><path d="M13.2 18v-5h1.7l.3-2h-2v-1.3c0-.6.2-1 1.1-1h1V6.9c-.5 0-1-.1-1.6-.1-1.6 0-2.7 1-2.7 2.8V11H9.3v2h1.7v5h2.2Z" fill="#07101d" /></svg>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14.7c1.2-2.9 4.5-3.1 6.3-.8 1.1-4.2 5.9-5.4 8.4-2.2 1.3-.3 2.5.2 3.1 1.5-.4 2.3-2.2 3.7-4.6 3.7H6.4c-1.7 0-2.7-.8-2.4-2.2Z" fill="currentColor" /><path d="M7 15.5h10.4" stroke="#07101d" strokeWidth="1.2" strokeLinecap="round" /></svg>
}
