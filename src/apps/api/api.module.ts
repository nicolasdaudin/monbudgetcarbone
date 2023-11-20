import { Module } from "@nestjs/common";
import { AirportApiModule } from "./airports/airports.api.module";
import { FlightTravelsApiModule } from "./flight-travels/flight-travels.api.module";

@Module({
  imports: [AirportApiModule, FlightTravelsApiModule],
})
export class ApiModule { }