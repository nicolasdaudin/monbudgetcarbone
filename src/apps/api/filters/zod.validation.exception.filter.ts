import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { Request, Response } from "express";

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const message = exception.getZodError().errors.map(error => error.message).join(', ');

    response
      .status(status)
      .json({
        statusCode: status,
        message
      });
  }
}