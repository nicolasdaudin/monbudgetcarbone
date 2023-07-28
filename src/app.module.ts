import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AddFlightTravelUseCase } from './application/usecases/add-flight-travel.usecase';
import { InMemoryAirportRepository } from './infra/airport.inmemory.repository';
import { AirportRepository } from './application/airport.repository';
import { FlightTravelRepository } from './application/flight-travel.repository';
import { InMemoryFlightTravelRepository } from './infra/flight-travel.inmemory.repository';
import { DistanceCalculator } from './application/distance-calculator';
import { RealDistanceCalculator } from './infra/real-distance-calculator';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AddFlightTravelUseCase,
    {
      provide: AirportRepository,
      useClass: InMemoryAirportRepository
    },
    {
      provide: FlightTravelRepository,
      useClass: InMemoryFlightTravelRepository
    },
    {
      provide: DistanceCalculator,
      useClass: RealDistanceCalculator
    }

  ],
})
export class AppModule { }
