import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { FlightTravelNotFound } from "../../../application/exceptions";


@Catch(FlightTravelNotFound)
export class FlightTravelNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: FlightTravelNotFound, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST;

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message
      });
  }
}