import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AddFlightTravelCommand, AddFlightTravelUseCase } from './application/usecases/add-flight-travel.usecase';
import { ViewFlightTravelsUseCase } from './application/usecases/view-flight-travels.usecase';

@Controller('api/flight-travels')
export class FlightTravelController {
  constructor(
    private readonly addFlightTravelUseCase: AddFlightTravelUseCase,
    private readonly viewFlightTravelsUseCase: ViewFlightTravelsUseCase) { }

  @Post()
  async addFlightTravel(@Body() body: {
    fromIataCode: string,
    toIataCode: string,
    outboundDate: string,
    user: string
  }) {
    const addFlightTravelCommand: AddFlightTravelCommand = {
      fromIataCode: body.fromIataCode,
      toIataCode: body.toIataCode,
      outboundDate: new Date(body.outboundDate),
      user: body.user
    }
    await this.addFlightTravelUseCase.handle(addFlightTravelCommand);

  }

  @Get()
  async getFlightTravels(@Query('user') user: string) {
    const flightTravels = await this.viewFlightTravelsUseCase.handle({ user });//?
    return flightTravels;
  }
}
