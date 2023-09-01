import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootApiController {
  @Get()
  getHello(): string {
    return 'Bienvenue sur Mon Budget Carbone';
  }
}
