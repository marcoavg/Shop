import { BadRequestException, Get, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dts';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}
  
  async create(createUserDto: CreateUserDto) {
    try{
      const  { password, ...userData } = createUserDto
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      await this.userRepository.save(user)
      user.password = '';
      const { email, fullName, uuid } = user;
      return { email, fullName, uuid, token: this.getJwtToken({id: user.uuid}) };

    }catch(error){
      this.handleDBError(error)
    }
    
  }
  
  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto

    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, uuid: true}
    });

    if(!user){
      throw new UnauthorizedException('credenciales no validas (email)')
    }
    if(!bcrypt.compareSync(password, user.password)){
      throw new UnauthorizedException('credenciales no validas (password)')
    }

    return { ...user, token: this.getJwtToken({id: user.uuid}) };

  }

  private getJwtToken( payload: JwtPayload ){
    const token = this.jwtService.sign( payload );
    return token;
  }

  
  privateRoute() {
    return 'This is a private route';
  }

  private handleDBError(error: any): never{
    console.log(error.detail)
    if(error.code === '23505'){
     throw new BadRequestException(error.detail)
    } 
  

    throw new InternalServerErrorException('check logs')
  }
}
