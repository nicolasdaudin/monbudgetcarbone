import { DistanceCalculator, calculateFromCoordinates } from "../application/distance-calculator";

export class RealDistanceCalculator implements DistanceCalculator {
  calculate(lngLatFrom: string, lngLatTo: string): number {
    return calculateFromCoordinates(lngLatFrom, lngLatTo);

  }
}

