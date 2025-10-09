import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dts';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ){}

  create(createUserDto: CreateUserDto) {
    try{
      const user = this.userRepository.create(createUserDto);
      
    }catch(error){

    }
  }
}
