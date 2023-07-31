import { Body, Controller, Post } from '@nestjs/common';
import { AddFlightTravelCommand, AddFlightTravelUseCase } from './application/usecases/add-flight-travel.usecase';

@Controller('flight-travel')
export class FlightTravelController {
  constructor(private readonly addFlightTravelUseCase: AddFlightTravelUseCase) { }

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
}
