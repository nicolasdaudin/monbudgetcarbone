import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { DistanceCalculator } from "../../../application/distance-calculator";
import { FlightTravelRepository } from "../../../application/flight-travel.repository";
import { AddFlightTravelUseCase } from "../../../application/usecases/add-flight-travel.usecase";
import { DeleteFlightTravelUseCase } from "../../../application/usecases/delete-flight-travel.usecase";
import { EditFlightTravelUseCase } from "../../../application/usecases/edit-flight-travel.usecase";
import { ViewFlightTravelsUseCase } from "../../../application/usecases/view-flight-travels.usecase";
import { PrismaFlightTravelRepository } from "../../../infra/flight-travel.prisma.repository";
import { RealDistanceCalculator } from "../../../infra/real-distance-calculator";
import { AirportModule } from "../../common/airport.module";
import { FlightTravelsApiController } from "./flight-travels.api.controller";

@Module({
  imports: [AirportModule],
  controllers: [FlightTravelsApiController],
  providers: [
    PrismaClient,
    AddFlightTravelUseCase,
    ViewFlightTravelsUseCase,
    EditFlightTravelUseCase,
    DeleteFlightTravelUseCase,
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
export class FlightTravelsApiModule { }