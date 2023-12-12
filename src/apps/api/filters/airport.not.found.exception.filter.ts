import { ArgumentsHost, Catch, ExceptionFilter, HttpCode, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { AirportNotFound } from "../../../application/exceptions";
import { HttpErrorByCode } from "@nestjs/common/utils/http-error-by-code.util";


@Catch(AirportNotFound)
export class AirportNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: AirportNotFound, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST

    response
      .status(status)
      .json({
        statusCode: status,
        message: exception.message,
        iataCode: exception.iataCode
      });
  }
}