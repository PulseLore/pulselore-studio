import type { Credit } from '../data/passport'

type CreditListProps = {
  credits: Credit[]
}

export function CreditList({ credits }: CreditListProps) {
  return (
    <dl className="credit-list">
      {credits.map((credit) => (
        <div className={`credit-row ${credit.role === 'AI Demo / Source Stems' ? 'credit-source' : ''}`} key={credit.role}>
          <dt>{credit.role}</dt>
          <dd>
            <strong>{credit.person}</strong>
            {credit.note && <span className="credit-note">{credit.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
