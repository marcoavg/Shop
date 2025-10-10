import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],
  exports:[ProductsService, 
    TypeOrmModule
  ]
})
export class ProductsModule {}
