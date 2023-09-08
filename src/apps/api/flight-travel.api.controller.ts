import { Body, Controller, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { AddFlightTravelUseCase, AddFlightTravelCommand } from '../../application/usecases/add-flight-travel.usecase';
import { DeleteFlightTravelUseCase } from '../../application/usecases/delete-flight-travel.usecase';
import { EditFlightTravelUseCase, EditFlightTravelCommand } from '../../application/usecases/edit-flight-travel.usecase';
import { ViewFlightTravelsUseCase } from '../../application/usecases/view-flight-travels.usecase';


@Controller('api/flight-travels')
export class FlightTravelApiController {
  constructor(
    private readonly addFlightTravelUseCase: AddFlightTravelUseCase,
    private readonly viewFlightTravelsUseCase: ViewFlightTravelsUseCase,
    private readonly editFlightTravelUseCase: EditFlightTravelUseCase,
    private readonly deleteFlightTravelUseCase: DeleteFlightTravelUseCase) { }

  @Post()
  async addFlightTravel(@Body() body: {
    fromIataCode: string,
    toIataCode: string,
    outboundDate: string,
    inboundDate?: string,
    outboundConnection?: string,
    inboundConnection?: string,
    user: string
  }) {
    const addFlightTravelCommand: AddFlightTravelCommand = {
      fromIataCode: body.fromIataCode,
      toIataCode: body.toIataCode,
      outboundDate: new Date(body.outboundDate),
      ... (body.inboundDate ? { inboundDate: new Date(body.inboundDate) } : {}),
      ... (body.outboundConnection ? { outboundConnection: body.outboundConnection } : {}),
      ... (body.inboundConnection ? { inboundConnection: body.inboundConnection } : {}),
      user: body.user
    }
    await this.addFlightTravelUseCase.handle(addFlightTravelCommand);

  }

  @Post(':id')
  async editFlightTravel(@Param('id') id: string, @Body() body: {
    fromIataCode: string,
    toIataCode: string,
    outboundDate: string,
    inboundDate?: string,
    outboundConnection?: string,
    inboundConnection?: string,
    user: string
  }) {

    const editFlightTravelCommand: EditFlightTravelCommand = {
      id: +id,
      fromIataCode: body.fromIataCode,
      toIataCode: body.toIataCode,
      outboundDate: new Date(body.outboundDate),
      ... (body.inboundDate ? { inboundDate: new Date(body.inboundDate) } : {}),
      ... (body.outboundConnection ? { outboundConnection: body.outboundConnection } : {}),
      ... (body.inboundConnection ? { inboundConnection: body.inboundConnection } : {}),
      user: body.user
    }
    await this.editFlightTravelUseCase.handle(editFlightTravelCommand);

  }

  @Get()
  async getFlightTravels(@Query('user') user: string) {
    const flightTravels = await this.viewFlightTravelsUseCase.handle({ user });
    console.log('getting flight travels for user', user);
    console.log({ flightTravels });
    return flightTravels;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteFlightTravel(@Param('id') id: string) {
    await this.deleteFlightTravelUseCase.handle(+id);
  }
}
