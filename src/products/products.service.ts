import { BadGatewayException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) {}


  async create(createProductDto: CreateProductDto) {
    try {
      const { images, ...productDetails } = createProductDto;
      const imagesEntities = images?.map(image => ({ url: image })) || [];
      const newProduct = this.productsRepository.create({
        ...productDetails,
        images: imagesEntities
      });
      await this.productsRepository.save(newProduct);
      this.logger.log(`Product created with ID: ${newProduct.id}`);
      return newProduct;
    } catch (error) {
      this.logger.error(`Error creating product: ${error.message}`);
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productsRepository.find({
      take: limit,
      skip: offset,
      relations: { images: true }
    });
    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images?.map(img => img.url)
      //images: images?.map(img => ({ img: img.url }))
    })) || [];
  }

  async findOne(value: string) {
    let product: Product | null = null;
    if (isUUID(value)) {
      product = await this.productsRepository.findOneBy({ id: value }); 
    }
    else {
      const queryBuilder = this.productsRepository.createQueryBuilder('prod');
      product = await queryBuilder.where('UPPER(title) =:title or slug =:slug', {
        title: value.toUpperCase(),
        slug: value.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }
    if(!product) throw new NotFoundException(`Product with ID ${value} not found`);
    return product;
  }

  async findOnePlain(value: string) {
    const { images, ...rest } = await this.findOne(value);
    return {
      ...rest,
      images: images?.map(img => img.url)
    };
  } 

  async update(value: string, updateProductDto: UpdateProductDto) {
    const { images, ...restUpdateDto } = updateProductDto;
    const imr = images
    // let imagesEntities;
    // if (images) {
    //   imagesEntities = images.map(image => ({ url: image }));
    // }
    const product = await this.productsRepository.preload({
      id: value,
      ...restUpdateDto,
      // ...(images ? { images: imagesEntities } : {})
    });
    if (!product) throw new NotFoundException(`Product with ID ${value} not found`);
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // await this.productsRepository.save(product);
    try {
      if (imr) {
        await queryRunner.manager.delete(ProductImage, { product: { id: value } });
        product.images = imr.map(img => this.productImagesRepository.create({ url: img }));
      }else{
         product.images = await this.productImagesRepository.findBy({ product: { id: value } });
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productsRepository.save(product);
      const { images, ...rest } = product;
      return {
        ...rest,
        images: images?.map(img => img.url)
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(value: string) {
    const product = await this.findOne(value);
    if (!product) throw new NotFoundException(`Product with ID ${value} not found`);
    // return await this.productsRepository.remove(product);
    // Delete by id without fetching the entity first from the database 
    return await this.productsRepository.remove(product);
  }

  private handleDBExceptions(error:any){
    if (error.code === '23505') { // Unique violation error code for PostgreSQL
        throw new BadGatewayException(error.detail);
      }
      this.logger.error('Error creating product:', error.message);
      throw new InternalServerErrorException('Check server logs for more details');
  }


  async deleteAllProducts() {
    const query = this.productsRepository.createQueryBuilder('product');  
    try {
      return await query
      .delete()
      .where({})
      .from(Product)
      .execute();
    } catch (error) {
      this.handleDBExceptions(error); 
    }
  }
}
