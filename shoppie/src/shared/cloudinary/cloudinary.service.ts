/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at: string;
  width?: number;
  height?: number;
  folder: string;
}

export interface ShopieUploadConfig {
  uploadType: ShopieUploadType;
  maxSizeBytes: number;
  allowedFormats: string[];
  folder: string;
  transformations?: any;
}

export enum ShopieUploadType {
  USER_PROFILE = 'user_profile',
  PRODUCT_IMAGE = 'product_image',
  CATEGORY_IMAGE = 'category_image',
  SHOP_LOGO = 'shop_logo',
  DOCUMENT = 'document',
  MARKETING = 'marketing',
  BANNER = 'banner',
}

@Injectable()
export class ShopieCloudinaryService {
  private readonly logger = new Logger(ShopieCloudinaryService.name);

  constructor(private configService: ConfigService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    this.logger.log('Shopie Cloudinary service initialized');
  }

  private getUploadConfig(uploadType: ShopieUploadType): ShopieUploadConfig {
    const configs: Record<ShopieUploadType, ShopieUploadConfig> = {
      [ShopieUploadType.USER_PROFILE]: {
        uploadType,
        maxSizeBytes: 2 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'shopie/users/profiles',
        transformations: {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          format: 'auto',
        },
      },
      [ShopieUploadType.PRODUCT_IMAGE]: {
        uploadType,
        maxSizeBytes: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'shopie/products/images',
        transformations: {
          width: 800,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [ShopieUploadType.CATEGORY_IMAGE]: {
        uploadType,
        maxSizeBytes: 5 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'shopie/categories/images',
        transformations: {
          width: 600,
          height: 400,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [ShopieUploadType.SHOP_LOGO]: {
        uploadType,
        maxSizeBytes: 2 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'shopie/logos',
        transformations: {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [ShopieUploadType.DOCUMENT]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024,
        allowedFormats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
        folder: 'shopie/documents',
      },
      [ShopieUploadType.MARKETING]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        folder: 'shopie/marketing',
        transformations: {
          width: 1200,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [ShopieUploadType.BANNER]: {
        uploadType,
        maxSizeBytes: 8 * 1024 * 1024,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'shopie/banners',
        transformations: {
          width: 1600,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
    };

    return configs[uploadType];
  }


}
