import { IsDateString, IsNotEmpty, IsOptional, ValidateIf } from "class-validator";
import { PartialType } from '@nestjs/swagger';
import { Airport } from "./airport";
import { z } from "nestjs-zod/z";
import { createZodDto } from "nestjs-zod";

const CreateFlightTravelSchema = z.object({
  fromIataCode: z.string().min(3).max(3),
  toIataCode: z.string().min(3).max(3),
  outboundDate: z.dateString().format('date'),
  inboundDate: z.dateString().format('date').optional(),
  outboundConnectionIataCode: z.string().min(3).max(3).optional(),
  inboundConnectionIataCode: z.string().min(3).max(3).optional(),
  user: z.string()
});

export class CreateFlightTravelDto extends createZodDto(CreateFlightTravelSchema) { }

export class CreateFlightTravelDtoOld {
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
export class UpdateFlightTravelDto extends CreateFlightTravelDto { }

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