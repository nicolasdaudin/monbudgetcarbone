import { Controller, Get, Render } from '@nestjs/common';
import { ViewFlightTravelsUseCase } from '../../application/usecases/view-flight-travels.usecase';

@Controller()
export class RootWebController {
  constructor
    (private readonly viewFlightTravelsUseCase: ViewFlightTravelsUseCase) { }

  @Get()
  @Render('index')
  async root() {

    const flightTravels = await this.viewFlightTravelsUseCase.handle({ user: 'Toto' })
    return {
      message: 'Bienvenue sur la web app de Mon Budget Carbone',
      flightTravels,
      kgCO2total: flightTravels.reduce((prev, curr) => (curr.kgCO2eqTotal + prev), 0)
    };
  }
}
