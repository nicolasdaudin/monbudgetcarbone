import { IsDateString, IsNotEmpty, IsOptional } from "class-validator";

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