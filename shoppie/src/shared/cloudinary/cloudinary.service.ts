/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Result interface for Cloudinary uploads
 * Contains all essential information returned after successful upload
 */
export interface CloudinaryUploadResult {
  public_id: string; // Unique identifier for the uploaded file
  secure_url: string; // HTTPS URL to access the file
  url: string; // HTTP URL to access the file
  original_filename: string; // Original name of the uploaded file
  bytes: number; // File size in bytes
  format: string; // File format (jpg, png, pdf, etc.)
  resource_type: string; // Type of resource (image, video, raw)
  created_at: string; // Upload timestamp
  width?: number; // Image width (for images only)
  height?: number; // Image height (for images only)
  folder: string; // Cloudinary folder path
}

/**
 * Configuration for different upload types in hotel management
 */
export interface HotelUploadConfig {
  uploadType: HotelUploadType;
  maxSizeBytes: number; // Maximum file size allowed
  allowedFormats: string[]; // Allowed file extensions
  folder: string; // Cloudinary folder structure
  transformations?: any; // Image transformation options
}

/**
 * Enum defining all upload types used in hotel management system
 */
export enum HotelUploadType {
  USER_PROFILE = 'user_profile', // User profile pictures
  ROOM_IMAGE = 'room_image', // Room photos
  ROOM_TYPE_IMAGE = 'room_type_image', // Room type showcase images
  BOOKING_DOCUMENT = 'booking_document', // Booking-related documents
  ID_DOCUMENT = 'id_document', // Identification documents
  HOTEL_AMENITY = 'hotel_amenity', // Hotel facility images
  GALLERY = 'gallery', // Hotel gallery images
  DOCUMENT = 'document', // General documents
  MARKETING = 'marketing', // Marketing materials
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    // Initialize Cloudinary with environment variables
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.logger.log('Cloudinary service initialized successfully');
  }

  /**
   * Get upload configuration based on upload type
   * Each type has specific size limits, allowed formats, and folder structure
   */
  private getUploadConfig(uploadType: HotelUploadType): HotelUploadConfig {
    const configs: Record<HotelUploadType, HotelUploadConfig> = {
      [HotelUploadType.USER_PROFILE]: {
        uploadType,
        maxSizeBytes: 2 * 1024 * 1024, // 2MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'hotel-management/users/profiles',
        transformations: {
          width: 400,
          height: 400,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          format: 'auto',
        },
      },
      [HotelUploadType.ROOM_IMAGE]: {
        uploadType,
        maxSizeBytes: 8 * 1024 * 1024, // 8MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'hotel-management/rooms/images',
        transformations: {
          width: 1200,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [HotelUploadType.ROOM_TYPE_IMAGE]: {
        uploadType,
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'hotel-management/room-types/images',
        transformations: {
          width: 800,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [HotelUploadType.BOOKING_DOCUMENT]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
        folder: 'hotel-management/bookings/documents',
      },
      [HotelUploadType.ID_DOCUMENT]: {
        uploadType,
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        folder: 'hotel-management/users/documents',
      },
      [HotelUploadType.HOTEL_AMENITY]: {
        uploadType,
        maxSizeBytes: 8 * 1024 * 1024, // 8MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'hotel-management/amenities',
        transformations: {
          width: 800,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [HotelUploadType.GALLERY]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        folder: 'hotel-management/gallery',
        transformations: {
          width: 1200,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
      [HotelUploadType.DOCUMENT]: {
        uploadType,
        maxSizeBytes: 15 * 1024 * 1024, // 15MB
        allowedFormats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
        folder: 'hotel-management/documents/general',
      },
      [HotelUploadType.MARKETING]: {
        uploadType,
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
        folder: 'hotel-management/marketing',
        transformations: {
          width: 1200,
          height: 800,
          crop: 'fill',
          quality: 'auto',
          format: 'auto',
        },
      },
    };

    return configs[uploadType];
  }

  /**
   * Validate uploaded file against configuration rules
   * Checks file size, format, and MIME type
   */
  private validateFile(
    file: Express.Multer.File,
    config: HotelUploadConfig,
  ): void {
    // Check if file exists
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > config.maxSizeBytes) {
      const maxSizeMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSizeMB}MB for ${config.uploadType}`,
      );
    }

    // Check file extension
    const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
    if (!fileExtension || !config.allowedFormats.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file format. Allowed formats for ${config.uploadType}: ${config.allowedFormats.join(', ')}`,
      );
    }

    // Check MIME type
    const allowedMimeTypes = this.getMimeTypesForFormats(config.allowedFormats);
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid MIME type. Expected one of: ${allowedMimeTypes.join(', ')}`,
      );
    }

    this.logger.debug(
      `File validation passed for ${config.uploadType}: ${file.originalname}`,
    );
  }

  /**
   * Map file extensions to their corresponding MIME types
   * Used for additional validation security
   */
  private getMimeTypesForFormats(formats: string[]): string[] {
    const mimeTypeMap: Record<string, string[]> = {
      jpg: ['image/jpeg'],
      jpeg: ['image/jpeg'],
      png: ['image/png'],
      webp: ['image/webp'],
      pdf: ['application/pdf'],
      doc: ['application/msword'],
      docx: [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      txt: ['text/plain'],
    };

    return formats.flatMap((format) => mimeTypeMap[format] || []);
  }

  /**
   * Generate unique public ID for uploaded files
   * Format: folder/entityType/entityId/uploadType_timestamp_random
   */
  private generatePublicId(
    config: HotelUploadConfig,
    entityId?: string | number,
    entityType?: string,
  ): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);

    if (entityId && entityType) {
      return `${config.folder}/${entityType}/${entityId}/${config.uploadType}_${timestamp}_${randomString}`;
    }

    return `${config.folder}/${config.uploadType}_${timestamp}_${randomString}`;
  }

  /**
   * Upload single file to Cloudinary
   * Main upload method used by all other upload functions
   */
  async uploadFile(
    file: Express.Multer.File,
    uploadType: HotelUploadType,
    options?: {
      entityId?: string | number;
      entityType?: string;
      tags?: string[];
      context?: Record<string, any>;
    },
  ): Promise<CloudinaryUploadResult> {
    try {
      const config = this.getUploadConfig(uploadType);

      // Validate file
      this.validateFile(file, config);

      // Generate unique public ID
      const publicId = this.generatePublicId(
        config,
        options?.entityId,
        options?.entityType,
      );

      this.logger.log(`Uploading ${uploadType} file: ${file.originalname}`);

      // Prepare upload options
      const uploadOptions: any = {
        public_id: publicId,
        resource_type: 'auto',
        tags: [
          uploadType,
          ...(options?.tags || []),
          ...(options?.entityType ? [options.entityType] : []),
          ...(options?.entityId
            ? [`${options.entityType}-${options.entityId}`]
            : []),
        ].filter(Boolean),
        context: {
          upload_type: uploadType,
          uploaded_at: new Date().toISOString(),
          ...(options?.context || {}),
        },
      };

      // Add transformations for images
      if (config.transformations) {
        uploadOptions.transformation = config.transformations;
      }

      // Upload to Cloudinary
      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: any, result: any) => {
              if (error) {
                this.logger.error(`Cloudinary upload failed: ${error.message}`);
                reject(
                  new BadRequestException(`Upload failed: ${error.message}`),
                );
              } else if (result) {
                resolve({
                  public_id: result.public_id,
                  secure_url: result.secure_url,
                  url: result.url,
                  original_filename: result.original_filename,
                  bytes: result.bytes,
                  format: result.format,
                  resource_type: result.resource_type,
                  created_at: result.created_at,
                  width: result.width,
                  height: result.height,
                  folder: result.folder,
                });
              } else {
                reject(
                  new BadRequestException('Upload failed: No result returned'),
                );
              }
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      this.logger.log(
        `Successfully uploaded ${uploadType} with public_id: ${result.public_id}`,
      );
      return result;
    } catch (error: any) {
      this.logger.error(
        `File upload failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Upload multiple files at once
   * Used for bulk uploads like room image galleries
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadType: HotelUploadType,
    options?: {
      entityId?: string | number;
      entityType?: string;
      tags?: string[];
      context?: Record<string, any>;
    },
  ): Promise<CloudinaryUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    this.logger.log(`Uploading ${files.length} files of type ${uploadType}`);

    try {
      const uploadPromises = files.map((file, index) =>
        this.uploadFile(file, uploadType, {
          ...options,
          tags: [...(options?.tags || []), `batch-${Date.now()}-${index}`],
        }),
      );

      const results = await Promise.all(uploadPromises);
      this.logger.log(`Successfully uploaded ${results.length} files`);
      return results;
    } catch (error: any) {
      this.logger.error(
        `Batch upload failed: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('One or more file uploads failed');
    }
  }

  /**
   * Upload user profile image with automatic old image cleanup
   */
  async uploadUserProfileImage(
    file: Express.Multer.File,
    userId: string,
    oldImageUrl?: string,
  ): Promise<CloudinaryUploadResult> {
    try {
      // Delete old profile image if exists
      if (oldImageUrl) {
        const oldPublicId = this.extractPublicIdFromUrl(oldImageUrl);
        await this.deleteFile(oldPublicId).catch((error) => {
          this.logger.warn(
            `Failed to delete old profile image: ${error.message}`,
          );
        });
      }

      return await this.uploadFile(file, HotelUploadType.USER_PROFILE, {
        entityId: userId,
        entityType: 'user',
        tags: ['profile', 'user'],
        context: { user_id: userId },
      });
    } catch (error) {
      this.logger.error(
        `Profile image upload failed for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Upload room images with room association
   */
  async uploadRoomImages(
    files: Express.Multer.File[],
    roomId: number,
  ): Promise<CloudinaryUploadResult[]> {
    return await this.uploadMultipleFiles(files, HotelUploadType.ROOM_IMAGE, {
      entityId: roomId,
      entityType: 'room',
      tags: ['room', 'accommodation'],
      context: { room_id: roomId },
    });
  }

  /**
   * Upload room type showcase images
   */
  async uploadRoomTypeImages(
    files: Express.Multer.File[],
    roomTypeId: number,
  ): Promise<CloudinaryUploadResult[]> {
    return await this.uploadMultipleFiles(
      files,
      HotelUploadType.ROOM_TYPE_IMAGE,
      {
        entityId: roomTypeId,
        entityType: 'room-type',
        tags: ['room-type', 'showcase'],
        context: { room_type_id: roomTypeId },
      },
    );
  }

  /**
   * Upload booking-related documents
   */
  async uploadBookingDocument(
    file: Express.Multer.File,
    bookingId: number,
    documentDescription?: string,
  ): Promise<CloudinaryUploadResult> {
    return await this.uploadFile(file, HotelUploadType.BOOKING_DOCUMENT, {
      entityId: bookingId,
      entityType: 'booking',
      tags: ['booking', 'document'],
      context: {
        booking_id: bookingId,
        description: documentDescription || 'Booking document',
      },
    });
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      this.logger.log(`Deleting file with public_id: ${publicId}`);

      const result: any = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new BadRequestException(
          `Failed to delete file: ${result.result}`,
        );
      }

      this.logger.log(`Successfully deleted file: ${publicId}`);
    } catch (error: any) {
      this.logger.error(
        `File deletion failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Delete multiple files at once
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<void> {
    if (!publicIds || publicIds.length === 0) {
      return;
    }

    try {
      this.logger.log(`Deleting ${publicIds.length} files`);

      const result: any = await cloudinary.api.delete_resources(publicIds);
      this.logger.log(`Bulk deletion result: ${JSON.stringify(result)}`);
    } catch (error: any) {
      this.logger.error(
        `Bulk deletion failed: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to delete multiple files');
    }
  }

  /**
   * Generate signed URL for secure file access
   */
  generateSignedUrl(publicId: string, expirationMinutes: number = 60): string {
    const timestamp = Math.round(Date.now() / 1000) + expirationMinutes * 60;

    return cloudinary.utils.private_download_url(publicId, 'auto', {
      resource_type: 'auto',
      expires_at: timestamp,
    });
  }

  /**
   * Get optimized URL with transformations
   */
  getOptimizedUrl(
    publicId: string,
    transformations?: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
      format?: string;
    },
  ): string {
    return cloudinary.url(publicId, {
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations,
    });
  }

  /**
   * Get thumbnail URL for images
   */
  getThumbnailUrl(
    publicId: string,
    width: number = 300,
    height: number = 200,
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    });
  }

  /**
   * Get file metadata from Cloudinary
   */
  async getFileInfo(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId);
    } catch (error: any) {
      this.logger.error(
        `Failed to get file info: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('File not found');
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   * Used for cleanup operations
   */
  private extractPublicIdFromUrl(url: string): string {
    try {
      // Extract public_id from Cloudinary URL
      const matches = url.match(/\/([^\/]+)\.[^\/]+$/);
      if (matches && matches[1]) {
        return matches[1];
      }

      // Alternative method for complex URLs
      const parts = url.split('/');
      const fileWithExtension = parts[parts.length - 1];
      const publicId = fileWithExtension.split('.')[0];

      // Reconstruct full public_id with folder path if needed
      const folderParts = parts.slice(parts.indexOf('hotel-management'));
      folderParts[folderParts.length - 1] = publicId;

      return folderParts.join('/');
    } catch {
      this.logger.warn(`Failed to extract public_id from URL: ${url}`);
      return url; // Return original URL as fallback
    }
  }

  /**
   * Get files by tags (useful for fetching related images)
   */
  async getFilesByTag(tag: string, maxResults: number = 50): Promise<any[]> {
    try {
      const result = await cloudinary.api.resources_by_tag(tag, {
        max_results: maxResults,
        resource_type: 'auto',
      });

      return result.resources || [];
    } catch (error: any) {
      this.logger.error(
        `Failed to get files by tag ${tag}: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException(`Failed to fetch files with tag: ${tag}`);
    }
  }

  /**
   * Search files by context (useful for finding user or entity-specific files)
   */
  async searchFilesByContext(
    contextKey: string,
    contextValue: string,
    maxResults: number = 50,
  ): Promise<any[]> {
    try {
      const result = await cloudinary.search
        .expression(`context.${contextKey}=${contextValue}`)
        .max_results(maxResults)
        .execute();

      return result.resources || [];
    } catch (error: any) {
      this.logger.error(
        `Failed to search files by context ${contextKey}=${contextValue}: ${error?.message || 'Unknown error'}`,
      );
      throw new BadRequestException('Search failed');
    }
  }
}
