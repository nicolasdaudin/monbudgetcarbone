import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { AddFlightTravelUseCase, AddFlightTravelCommand } from '../../../application/usecases/add-flight-travel.usecase';
import { DeleteFlightTravelUseCase } from '../../../application/usecases/delete-flight-travel.usecase';
import { EditFlightTravelUseCase, EditFlightTravelCommand } from '../../../application/usecases/edit-flight-travel.usecase';
import { ViewFlightTravelsUseCase } from '../../../application/usecases/view-flight-travels.usecase';
import { CreateFlightTravelDto, UpdateFlightTravelDTO } from '../../../domain/flight-travel.dto';
import { AirportNotFound, FlightTravelNotFound } from '../../../application/exceptions';


@Controller('api/flight-travels')
export class FlightTravelsApiController {
  constructor(
    private readonly addFlightTravelUseCase: AddFlightTravelUseCase,
    private readonly viewFlightTravelsUseCase: ViewFlightTravelsUseCase,
    private readonly editFlightTravelUseCase: EditFlightTravelUseCase,
    private readonly deleteFlightTravelUseCase: DeleteFlightTravelUseCase) { }

  @Post()
  async addFlightTravel(@Body() body: CreateFlightTravelDto) {
    const addFlightTravelCommand: AddFlightTravelCommand = {
      fromIataCode: body.fromIataCode,
      toIataCode: body.toIataCode,
      outboundDate: new Date(body.outboundDate),
      ... (body.inboundDate ? { inboundDate: new Date(body.inboundDate) } : {}),
      ... (body.outboundConnection ? { outboundConnection: body.outboundConnection } : {}),
      ... (body.inboundConnection ? { inboundConnection: body.inboundConnection } : {}),
      user: body.user
    }
    try {
      await this.addFlightTravelUseCase.handle(addFlightTravelCommand);
    } catch (error) {
      if (error instanceof AirportNotFound) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

    }

  }

  @Put(':id')
  async editFlightTravel(@Param('id') id: string, @Body() body: UpdateFlightTravelDTO) {

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
    try {
      await this.editFlightTravelUseCase.handle(editFlightTravelCommand);
    } catch (error) {
      if (error instanceof FlightTravelNotFound) {
        throw new HttpException(`There is no flight travel with id ${id}`, HttpStatus.NOT_FOUND);
      }
      if (error instanceof AirportNotFound) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }

  }

  @Get()
  async getFlightTravels(@Query('user') user: string) {
    const flightTravels = await this.viewFlightTravelsUseCase.handle({ user });
    // console.log('getting flight travels for user', user);
    // console.log({ flightTravels });
    return flightTravels;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteFlightTravel(@Param('id') id: string) {
    try {
      await this.deleteFlightTravelUseCase.handle(+id);
    } catch (error) {
      if (error instanceof FlightTravelNotFound) {
        throw new HttpException(`There is no flight travel with id ${id}`, HttpStatus.NOT_FOUND);
      }
    }
  }
}