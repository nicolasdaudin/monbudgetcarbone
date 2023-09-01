import { Module } from '@nestjs/common';
import { RootWebController } from './root.web.controller';
import { ViewFlightTravelsUseCase } from '../../application/usecases/view-flight-travels.usecase';
import { FlightTravelRepository } from '../../application/flight-travel.repository';
import { PrismaFlightTravelRepository } from '../../infra/flight-travel.prisma.repository';
import { PrismaClient } from "@prisma/client";


@Module({
  controllers: [RootWebController],
  providers: [
    PrismaClient,
    ViewFlightTravelsUseCase,
    {
      provide: FlightTravelRepository,
      useClass: PrismaFlightTravelRepository
    },
  ]
})
export class WebModule { }
