import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    this.logger.error('Exception caught:', exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || exception.message;
        error = responseObj.error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;

      if (exception.message.includes('ENOENT')) {
        status = HttpStatus.NOT_FOUND;
        message = 'File not found';
        error = 'Not Found';
      } else if (exception.message.includes('EACCES')) {
        status = HttpStatus.FORBIDDEN;
        message = 'Permission denied';
        error = 'Forbidden';
      } else if (exception.message.includes('Invalid base64')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid image format';
        error = 'Bad Request';
      } else if (exception.message.includes('P2002')) {
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        error = 'Conflict';
      } else if (exception.message.includes('P2003')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference. The referenced record does not exist.';
        error = 'Bad Request';
      } else if (exception.message.includes('P2025')) {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        error = 'Not Found';
      } else if (exception.message.includes('Prisma')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database operation failed';
        error = 'Bad Request';
      } else if (exception.message.includes('JWT')) {
        status = HttpStatus.UNAUTHORIZED;
        message = 'Invalid or expired token';
        error = 'Unauthorized';
      } else if (exception.message.includes('bcrypt')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Password hashing failed';
        error = 'Bad Request';
      } else if (exception.message.includes('uuid')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid UUID format';
        error = 'Bad Request';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message || 'Something went wrong';
        error = 'Bad Request';
      }
    } else {
      message = 'An unexpected error occurred';
      error = 'Internal Server Error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json(errorResponse);
  }
}
