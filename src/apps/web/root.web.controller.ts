import { Controller, Get, Param, Render } from '@nestjs/common';
import { ViewFlightTravelsUseCase } from '../../application/usecases/view-flight-travels.usecase';

@Controller()
export class RootWebController {
  constructor
    (private readonly viewFlightTravelsUseCase: ViewFlightTravelsUseCase) { }

  @Get()
  @Render('index')
  async root() {

    return {
      message: 'Bienvenue sur la web app de Mon Budget Carbone. Logge-toi avec ton user'
    };
  }

  @Get('/:user')
  @Render('flight-travels')
  async rootPerUser(@Param('user') user: string) {
    return {
      user
    };
  }
}
