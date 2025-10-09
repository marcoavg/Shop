import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

  
  getProductImage(imageName: string) {
    const imagePath = join(__dirname, '..', '..', 'static', 'products', imageName);
    if (!existsSync(imagePath)) {
      throw new BadRequestException('Image not found');
    }
    return imagePath;
  }

  
}
