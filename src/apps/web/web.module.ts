import { Module } from '@nestjs/common';
import { RootWebController } from './root.web.controller';

@Module({
  controllers: [RootWebController]
})
export class WebModule { }
