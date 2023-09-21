import { IsDateString, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { PartialType } from '@nestjs/swagger';

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
  outboundConnection: string;

  @IsOptional()
  inboundConnection: string;

}

// TODO: this depends on nest framework so it should be moved away from domain
export class UpdateFlightTravelDTO extends PartialType(CreateFlightTravelDto) { }