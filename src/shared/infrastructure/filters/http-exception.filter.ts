/**
 * @file Global HTTP Exception Filter.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface StandardHttpError { statusCode: number; message: string | object; timestamp: string; path: string; }

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('HttpExceptionFilter');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const path = request?.url || 'N/A';

        const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

        this.logger.error(`[http] Exception Caught: Status ${statusCode} Path: ${path} Message: ${JSON.stringify(message)}`, exception.stack);

        const errorResponse: StandardHttpError = { statusCode, message, timestamp: new Date().toISOString(), path };

        if (!response.headersSent) {
           response.status(statusCode).json(errorResponse);
        } else {
            this.logger.warn(`[http] Headers already sent for path ${path}, cannot send error response.`);
        }
    }
}