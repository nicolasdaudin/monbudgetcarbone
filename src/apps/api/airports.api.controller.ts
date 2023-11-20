import { Controller, Get, Query } from "@nestjs/common";
import { Airport, LARGE_AIRPORT_TYPE } from "../../domain/airport";
import { GetAirportsUseCase } from "../../application/usecases/get-airports.usecase";

@Controller('api/airports')
export class AirportsApiController {
  constructor(private readonly getAirportsUseCase: GetAirportsUseCase) { }

  @Get()
  async getAirports(@Query('q') searchStr: string) {
    const airports = await this.getAirportsUseCase.handle({ searchStr })

    return {
      data: { airports }
    };
  }
}