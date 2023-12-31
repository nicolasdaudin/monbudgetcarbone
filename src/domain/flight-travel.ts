export type FlightTravel = {
  id: number,
  user: string,
  routes: Route[]
}

export type FlightTravelWithoutId = Omit<FlightTravel, 'id'>

export type Route = {
  type: OutboundInboundType,
  order?: number,
  from: string,
  to: string,
  date: Date,
  distance: number,
  kgCO2eq: number
}

export type OutboundInboundType = 'outbound' | 'inbound'