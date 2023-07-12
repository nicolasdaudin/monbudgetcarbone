export type FlightTravel = {
  user: string,
  transportType: 'plane',
  from: string,
  to: string,
  date: Date,
  distance: number,
  kgCO2eq: number
}