/**
 * @file Global RPC Exception Filter for Microservices.
 * @author Roberto Morales
 * @version 1.0.0
 * @date 2025-05-01
 */

import { Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

interface StandardRpcError { status: number; message: string; timestamp: string; }

@Catch()
export class AllExceptionsFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    const timestamp = new Date().toISOString();
    const ctxType = host.getType();

    this.logger.error(`[${ctxType}] Exception caught: ${exception.message || exception}`, exception.stack);

    if (exception instanceof RpcException) {
      const rpcError = exception.getError();
      if (typeof rpcError === 'object' && rpcError !== null) {
        status = (rpcError as any).status || HttpStatus.BAD_REQUEST;
        message = (rpcError as any).message || 'RPC error occurred';
      } else { message = rpcError as string; status = HttpStatus.BAD_REQUEST; }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: StandardRpcError = { status, message, timestamp };
    if (ctxType === 'rpc') { return throwError(() => errorResponse); }
    // Avoid sending errors for non-RPC contexts if caught here, let HTTP filter handle HTTP
     return throwError(() => errorResponse); // Or handle differently
  }
}