import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/paginations.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':value')
  findOne(@Param('value') value: string) {
    return this.productsService.findOnePlain(value);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) value: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(value, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) value: string) {
    return this.productsService.remove(value);
  }

  deleteAll() {
    return this.productsService.deleteAllProducts();
  }
}
