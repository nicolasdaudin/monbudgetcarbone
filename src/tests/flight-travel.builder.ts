import { Route, FlightTravel, OutboundInboundType } from "../domain/flight-travel";

export const flightTravelBuilder = ({
  id = 1,
  user = 'Nicolas',
  routes = []
}: { id?: number, user?: string, routes?: Route[] } = {}) => {
  const props = { id, user, routes };
  return {
    withId(id: number) {
      return flightTravelBuilder({ ...props, id })
    },
    withUser(user: string) {
      return flightTravelBuilder({ ...props, user })
    },
    withRoutes(routes: Route[]) {
      return flightTravelBuilder({ ...props, routes })
    },
    build(): FlightTravel {
      return {
        id: props.id,
        user: props.user,
        routes: props.routes
      }
    }
  }
}

export const routeBuilder = ({ type = 'outbound', from = 'MAD', order = undefined,
  to = 'BRU',
  date = new Date(),
  distance = 0,
  kgCO2eq = 0
}: { type?: OutboundInboundType, order?: 1 | 2, from?: string, to?: string, date?: Date, distance?: number, kgCO2eq?: number } = {}) => {
  const props = { type, order, from, to, date, distance, kgCO2eq };
  return {
    withType(type: OutboundInboundType) {
      return routeBuilder({ ...props, type })
    },
    withOrder(order: 1 | 2) {
      return routeBuilder({ ...props, order })
    },
    from(from: string) {
      return routeBuilder({ ...props, from })
    },
    to(to: string) {
      return routeBuilder({ ...props, to })
    },
    travelledOn(date: Date) {
      return routeBuilder({ ...props, date })
    },
    withDistance(distance: number) {
      return routeBuilder({ ...props, distance })
    },
    withCarbonFootprint(kgCO2eq: number) {
      return routeBuilder({ ...props, kgCO2eq })
    },
    build(): Route {
      return {
        type: props.type,
        from: props.from,
        to: props.to,
        date: props.date,
        distance: props.distance,
        kgCO2eq: props.kgCO2eq,
        ...(props.order ? { order: props.order } : {})
      }
    }
  }

}