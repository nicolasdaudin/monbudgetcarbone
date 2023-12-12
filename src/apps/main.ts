import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { ZodValidationExceptionFilter } from './api/filters/zod.validation.exception.filter';
import { AirportNotFoundExceptionFilter } from './api/filters/airport.not.found.exception.filter';
import { FlightTravelNotFoundExceptionFilter } from './api/filters/flight.travel.not.found.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(path.join(__dirname, '../../', 'public'));
  app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.useGlobalPipes(new ZodValidationPipe())
  app.useGlobalFilters(
    new ZodValidationExceptionFilter(),
    new AirportNotFoundExceptionFilter(), new FlightTravelNotFoundExceptionFilter())



  const port = process.env.PORT || 3000
  await app.listen(port);
  console.log(`App listening on port ${port}`);
}
bootstrap();
