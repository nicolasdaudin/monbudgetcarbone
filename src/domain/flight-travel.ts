export type FlightTravel = {
  id: number,
  user: string,
  routes: Route[]
}

export type Route = {
  type: OutboundInboundType,
  from: string,
  to: string,
  date: Date,
  distance: number,
  kgCO2eq: number
}

export type OutboundInboundType = 'outbound' | 'inbound'