import { Controller, Get } from '@nestjs/common';

@Controller('/api')
export class RootApiController {
  @Get()
  getHello(): string {
    return 'Bienvenue sur Mon Budget Carbone';
  }
}
