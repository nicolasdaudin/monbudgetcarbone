import { DistanceCalculator, calculateFromCoordinates } from "../application/distance-calculator";

export class StubDistanceCalculator implements DistanceCalculator {
  enforcedDistance: number = -1;

  calculate(lngLatFrom: string, lngLatTo: string): number {
    if (this.enforcedDistance > 0) return this.enforcedDistance;

    return calculateFromCoordinates(lngLatFrom, lngLatTo);


  }

  enforceDistance(distance: number) {
    this.enforcedDistance = distance
  }

}