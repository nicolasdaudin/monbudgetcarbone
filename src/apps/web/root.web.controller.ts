import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootWebController {
  @Get()
  getHello(): string {
    return '<h1>Bienvenue sur la web app de Mon Budget Carbone</h1>';
  }
}
