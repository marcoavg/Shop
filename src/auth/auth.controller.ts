import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dts';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser, RawHeaders } from './decorator/get-user.decorator';
import e from 'express';
import { Raw } from 'typeorm';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ok } from 'assert';
import { RoleProtected } from './decorator/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto){
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard('jwt'))
  privateRoute(
    //@Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') emailUser: string,
    @RawHeaders() headers: string
  ) {

    console.log({user: user, email: emailUser, headers: headers});
    return 'This is a private route';
  }

  @Get('private2')
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  @RoleProtected(ValidRoles.admin)
  privateRoute2(
    @GetUser() user: User
  ) {

   
    return {
      ok: true, user
    }
  }

  @Get('private3')
  @Auth( ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User
  ) {

   
    return {
      ok: true, user
    }
  }
  
  
}
