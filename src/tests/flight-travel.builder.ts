import { FlightTravel } from "../domain/flight-travel";

export const flightTravelBuilder = ({
  id = 1,
  user = 'Nicolas',
  from = 'MAD',
  to = 'BRU',
  date = new Date(),
  distance = 0,
  kgCO2eq = 0
}: { id?: number, user?: string, from?: string, to?: string, date?: Date, distance?: number, kgCO2eq?: number } = {}) => {
  const props = { id, user, from, to, date, distance, kgCO2eq };
  return {
    withId(id: number) {
      return flightTravelBuilder({ ...props, id })
    },
    withUser(user: string) {
      return flightTravelBuilder({ ...props, user })
    },
    from(from: string) {
      return flightTravelBuilder({ ...props, from })
    },
    to(to: string) {
      return flightTravelBuilder({ ...props, to })
    },
    travelledOn(date: Date) {
      return flightTravelBuilder({ ...props, date })
    },
    withDistance(distance: number) {
      return flightTravelBuilder({ ...props, distance })
    },
    withCarbonFootprint(kgCO2eq: number) {
      return flightTravelBuilder({ ...props, kgCO2eq })
    },
    build(): FlightTravel {
      return {
        id: props.id,
        user: props.user,
        from: props.from,
        to: props.to,
        date: props.date,
        distance: props.distance,
        kgCO2eq: props.kgCO2eq
      }
    }
  }



}