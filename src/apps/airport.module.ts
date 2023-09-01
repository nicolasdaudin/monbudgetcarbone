import { Module } from "@nestjs/common";
import { AirportRepository } from "../application/airport.repository";
import { FileAirportRepository } from "../infra/airport.file.repository";

@Module({
  providers: [
    {
      provide: AirportRepository,
      useClass: FileAirportRepository
    }
  ],
  exports: [AirportRepository]
})
export class AirportModule { }