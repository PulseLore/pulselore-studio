import type { OfficialLink } from '../data/passport'
import { PlatformIcon } from './PlatformIcon'

type OfficialLinksProps = {
  links: OfficialLink[]
}

export function OfficialLinks({ links }: OfficialLinksProps) {
  return (
    <div className="official-links">
      {links.map((link) => (
        <a className={`official-link ${link.primary ? 'is-primary' : ''}`} href={link.href} target="_blank" rel="noreferrer" key={link.label}>
          <span className="platform-icon"><PlatformIcon name={link.icon} /></span>
          <span className="official-link-copy">
            <span>{link.label}</span>
            <small>{link.shortLabel}</small>
          </span>
          <span className="external-arrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  )
}
