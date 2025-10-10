
import { createParamDecorator, ExecutionContext } from '@nestjs/common'; 
import { Raw } from 'typeorm';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if(!user){
        throw new Error('User not found in request');
    }
    return data ? user?.[data] : user;    
  },
);


export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.rawHeaders;
    if(!headers){
        throw new Error('Headers not found in request');
    }
    return data ? headers?.[data] : headers;
  },
);