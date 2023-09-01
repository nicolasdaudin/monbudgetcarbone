import { Module } from '@nestjs/common';
import { RootApiController } from './api/root.api.controller';
import { PrismaClient } from '@prisma/client';
import { AirportRepository } from '../application/airport.repository';
import { DistanceCalculator } from '../application/distance-calculator';
import { FlightTravelRepository } from '../application/flight-travel.repository';
import { AddFlightTravelUseCase } from '../application/usecases/add-flight-travel.usecase';
import { DeleteFlightTravelUseCase } from '../application/usecases/delete-flight-travel.usecase';
import { EditFlightTravelUseCase } from '../application/usecases/edit-flight-travel.usecase';
import { ViewFlightTravelsUseCase } from '../application/usecases/view-flight-travels.usecase';
import { FileAirportRepository } from '../infra/airport.file.repository';
import { PrismaFlightTravelRepository } from '../infra/flight-travel.prisma.repository';
import { RealDistanceCalculator } from '../infra/real-distance-calculator';
import { FlightTravelApiController } from './api/flight-travel.api.controller';



@Module({
  imports: [],
  controllers: [RootApiController, FlightTravelApiController],
  providers: [
    AddFlightTravelUseCase,
    ViewFlightTravelsUseCase,
    EditFlightTravelUseCase,
    DeleteFlightTravelUseCase,
    PrismaClient,
    {
      provide: AirportRepository,
      useClass: FileAirportRepository
    },
    {
      provide: FlightTravelRepository,
      useClass: PrismaFlightTravelRepository
    },
    {
      provide: DistanceCalculator,
      useClass: RealDistanceCalculator
    }

  ],
})
export class AppModule { }
