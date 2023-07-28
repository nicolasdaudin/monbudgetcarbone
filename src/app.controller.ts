import { Controller, Post, Get } from '@nestjs/common';
import { AddFlightTravelCommand, AddFlightTravelUseCase } from './application/usecases/add-flight-travel.usecase';

@Controller()
export class AppController {
  constructor(private readonly addFlightTravelUseCase: AddFlightTravelUseCase) { }

  @Get()
  getHello(): string {
    return 'Bienvenue sur Mon Budget Carbone'
  }
}
