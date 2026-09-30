import { productionRoute } from '../data/passport'

export function RouteRail() {
  return (
    <div className="route-rail" aria-label="Production route">
      {productionRoute.map((step, index) => (
        <div className="route-step" key={`${step.name}-${step.role}`}>
          <div className={`route-node ${step.kind}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className="route-step-copy">
            <strong>{step.name}</strong>
            <span>{step.role}</span>
          </div>
          {index < productionRoute.length - 1 && <div className="route-connector" aria-hidden="true" />}
        </div>
      ))}
    </div>
  )
}
