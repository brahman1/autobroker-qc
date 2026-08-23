import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // S'assurer que le message est bien passé
    const message = exceptionResponse.message || exception.message;

    response
      .status(status)
      .json({
        success: false,
        statusCode: status,
        message: Array.isArray(message) ? message[0] : message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}
