import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AddFlightTravelCommand, AddFlightTravelUseCase } from './application/usecases/add-flight-travel.usecase';
import { ViewFlightTravelsUseCase } from './application/usecases/view-flight-travels.usecase';
import { EditFlightTravelCommand, EditFlightTravelUseCase } from './application/usecases/edit-flight-travel.usecase';

@Controller('api/flight-travels')
export class FlightTravelController {
  constructor(
    private readonly addFlightTravelUseCase: AddFlightTravelUseCase,
    private readonly viewFlightTravelsUseCase: ViewFlightTravelsUseCase,
    private readonly editFlightTravelUseCase: EditFlightTravelUseCase) { }

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

  @Post(':id')
  async editFlightTravel(@Param('id') id: string, @Body() body: {
    fromIataCode: string,
    toIataCode: string,
    outboundDate: string,
    user: string
  }) {

    const editFlightTravelCommand: EditFlightTravelCommand = {
      id: +id,
      fromIataCode: body.fromIataCode,
      toIataCode: body.toIataCode,
      outboundDate: new Date(body.outboundDate),
      user: body.user
    }
    await this.editFlightTravelUseCase.handle(editFlightTravelCommand);

  }

  @Get()
  async getFlightTravels(@Query('user') user: string) {
    const flightTravels = await this.viewFlightTravelsUseCase.handle({ user });
    return flightTravels;
  }
}
