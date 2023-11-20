import { Module } from "@nestjs/common";
import { GetAirportsUseCase } from "../../../application/usecases/get-airports.usecase";
import { AirportModule } from "../../common/airport.module";
import { AirportsApiController } from "./airports.api.controller";

@Module({
  imports: [AirportModule],
  controllers: [AirportsApiController],
  providers: [
    GetAirportsUseCase,

  ],
})
export class AirportApiModule { }