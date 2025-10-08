import { Injectable, Logger } from '@nestjs/common';
import { initialData } from './data/seed-data';
import { ProductsService } from './../products/products.service';

@Injectable()
export class SeedService {
 private readonly logger = new Logger(SeedService.name);
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  async runSeed() {
    await this.insertAllProducts();
    return 'SEED EXECUTED';
  }

  private async insertAllProducts(){
     await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises: Promise<any>[] = [];

    products.forEach( product => {
      insertPromises.push( this.productsService.create( product ) );
    });

    await Promise.all( insertPromises );


    return true;
  }
}
