type SectionHeadingProps = {
  number: string
  eyebrow: string
  title: string
}

export function SectionHeading({ number, eyebrow, title }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <span className="section-number">{number}</span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </div>
  )
}
