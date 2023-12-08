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
}).superRefine((data, ctx) => {
  // check if outbound date is before inbound date
  if (data.inboundDate && new Date(data.outboundDate) > new Date(data.inboundDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'inbound date must be after outbound date',
      path: ['inboundDate']
    })
  }

  // check if fromIataCode is different from toIataCode
  if (data.fromIataCode === data.toIataCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'fromIataCode must be different from toIataCode',
      path: ['fromIataCode', 'toIataCode']
    })
  }

  // check if there is an inboundDate when there is an inboundConnectionIataCode
  if (data.inboundConnectionIataCode && !data.inboundDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'inboundDate must be present when inboundConnectionIataCode is present',
      path: ['inboundDate']
    })
  }

  // check that outboundConnectionIataCode is different from fromIataCode and toIataCode
  if (data.outboundConnectionIataCode && (data.outboundConnectionIataCode === data.fromIataCode || data.outboundConnectionIataCode === data.toIataCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'outboundConnectionIataCode must be different from fromIataCode and toIataCode',
      path: ['outboundConnectionIataCode']
    })
  }

  // check that inboundConnectionIataCode is different from fromIataCode and toIataCode
  if (data.inboundConnectionIataCode && (data.inboundConnectionIataCode === data.fromIataCode || data.inboundConnectionIataCode === data.toIataCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'inboundConnectionIataCode must be different from fromIataCode and toIataCode',
      path: ['inboundConnectionIataCode']
    })
  }

});

export class CreateFlightTravelDto extends createZodDto(CreateFlightTravelSchema) { }

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