import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AddFlightTravelUseCase } from './application/usecases/add-flight-travel.usecase';
import { AirportRepository } from './application/airport.repository';
import { FlightTravelRepository } from './application/flight-travel.repository';
import { InMemoryFlightTravelRepository } from './infra/flight-travel.inmemory.repository';
import { DistanceCalculator } from './application/distance-calculator';
import { RealDistanceCalculator } from './infra/real-distance-calculator';
import { FileAirportRepository } from './infra/airport.file.repository';
import { FlightTravelController } from './flight-travel.controller';
import { ViewFlightTravelsUseCase } from './application/usecases/view-flight-travels.usecase';


@Module({
  imports: [],
  controllers: [AppController, FlightTravelController],
  providers: [
    AddFlightTravelUseCase,
    ViewFlightTravelsUseCase,
    {
      provide: AirportRepository,
      useClass: FileAirportRepository
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
