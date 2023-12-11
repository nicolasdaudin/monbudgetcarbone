import { Airport } from "./airport";
import { z } from "nestjs-zod/z";
import { createZodDto } from "nestjs-zod";
import { Dictionary } from "../common/dictionary";



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
      message: Dictionary.getMessage('error.inbound.date.after.outbound.date'),
      path: ['inboundDate']
    })
  }

  // check if fromIataCode is different from toIataCode
  if (data.fromIataCode === data.toIataCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: Dictionary.getMessage('error.from.iata.code.different.from.to.iata.code'),
      path: ['fromIataCode', 'toIataCode']
    })
  }

  // check if there is an inboundDate when there is an inboundConnectionIataCode
  if (data.inboundConnectionIataCode && !data.inboundDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: Dictionary.getMessage('error.inbound.date.when.inbound.connection'),
      path: ['inboundDate']
    })
  }

  // check that outboundConnectionIataCode is different from fromIataCode and toIataCode
  if (data.outboundConnectionIataCode && (data.outboundConnectionIataCode === data.fromIataCode || data.outboundConnectionIataCode === data.toIataCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: Dictionary.getMessage('error.outbound.connection.iata.code.different'),
      path: ['outboundConnectionIataCode']
    })
  }

  // check that inboundConnectionIataCode is different from fromIataCode and toIataCode
  if (data.inboundConnectionIataCode && (data.inboundConnectionIataCode === data.fromIataCode || data.inboundConnectionIataCode === data.toIataCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: Dictionary.getMessage('error.inbound.connection.iata.code.different'),
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