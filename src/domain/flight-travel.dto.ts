import { IsDateString, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { PartialType } from '@nestjs/swagger';
import { Airport } from "./airport";

export class CreateFlightTravelDto {
  @IsNotEmpty()
  fromIataCode: string;

  @IsNotEmpty()
  toIataCode: string;

  @IsDateString()
  @IsNotEmpty()
  outboundDate: string;


  @IsNotEmpty()
  user: string;

  @IsDateString()
  @IsOptional()
  inboundDate: string;

  @IsOptional()
  outboundConnectionIataCode: string;

  @IsOptional()
  inboundConnectionIataCode: string;

}

// TODO: this depends on nest framework so it should be moved away from domain
export class UpdateFlightTravelDTO extends CreateFlightTravelDto { }

export class ViewFlightTravelDto {
  id: number;
  from: Airport;
  to: Airport;
  outboundDate: Date | string;
  inboundDate?: Date | string;
  outboundConnection?: Airport;
  inboundConnection?: Airport;
  kgCO2eqTotal: number
}