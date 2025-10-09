import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import express from 'express'
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  getProductImage(
    @Res() res: express.Response,
    @Param('imageName') imageName: string
  ) {
    const imagePath = this.filesService.getProductImage(imageName);
    
    // res.status(403).json({
    //   ok: false,
    //   path: imageName
    // });

    res.sendFile(imagePath)
   
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },   // 5MB limit
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file provided or invalid file type');
    }
    const secureUrl = `${this.configService.get('HOST_API')}:${this.configService.get('PORT')}/api/files/product/${file.filename}`
    return { secureUrl}
    // const { imageUrl } = body;
    // return this.filesService.uploadProductImage(id, imageUrl);
  }
}
